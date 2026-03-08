import { BedrockService, ClaudeMessage, ClaudeModel } from './bedrockService';
import { PromptAdapter, PromptUseCase } from './promptAdapter';

type ViroEmotion = 'neutral' | 'encouraging' | 'thoughtful' | 'excited' | 'patient' | 'celebratory';

interface ViroResponse {
  acknowledge: string;
  question: string;
  analogy?: string;
  hint?: string;
  action: string;
  emotion: ViroEmotion;
  xpReward?: number;
}

interface ViroContext {
  studentQuestion: string;
  previousInteractions?: string[];
  detectedLanguage?: 'en' | 'hi' | 'hinglish';
  studentLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export class ViroService {
  private bedrock: BedrockService | null = null;
  private useBedrock: boolean;

  constructor() {
    // Feature flag to switch between hardcoded and Bedrock responses
    this.useBedrock = process.env.USE_BEDROCK === 'true';
    
    if (this.useBedrock) {
      const region = process.env.AWS_REGION || 'us-east-1';
      this.bedrock = new BedrockService(region);
      console.log('ViroService initialized with Amazon Bedrock');
    } else {
      console.log('ViroService initialized with hardcoded responses');
    }
  }
  /**
   * Generate Socratic response using RTF Framework
   */
  async generateSocraticResponse(context: ViroContext): Promise<ViroResponse> {
    try {
      const { studentQuestion, detectedLanguage = 'en', studentLevel = 'intermediate', previousInteractions = [] } = context;

      // Detect student's emotional state
      const emotionalState = this.detectEmotionalState(studentQuestion);
      
      // Check if student is asking for direct code
      const isAskingForCode = this.isAskingForDirectCode(studentQuestion);
      
      // Generate response based on RTF Framework
      if (this.useBedrock && this.bedrock) {
        return isAskingForCode
          ? this.generateRefusalResponse(studentQuestion, detectedLanguage)
          : await this.generateSocraticResponseWithBedrock(studentQuestion, detectedLanguage, studentLevel, emotionalState, previousInteractions);
      } else {
        return isAskingForCode
          ? this.generateRefusalResponse(studentQuestion, detectedLanguage)
          : this.generateSocraticResponse_Internal(studentQuestion, detectedLanguage, studentLevel, emotionalState, previousInteractions);
      }
    } catch (error) {
      console.error('Error generating Viro response:', error);
      throw error;
    }
  }

  /**
   * Generate Socratic response using Bedrock (Amazon Nova)
   */
  private async generateSocraticResponseWithBedrock(
    question: string,
    language: string,
    level: string,
    emotionalState: string,
    previousInteractions: string[]
  ): Promise<ViroResponse> {
    const isHinglish = language === 'hi' || language === 'hinglish';
    
    // Build system prompt for Viro's Socratic teaching style
    const systemPrompt = this.buildViroSystemPrompt(isHinglish, level, emotionalState);
    
    // Build user prompt with context
    const userPrompt = this.buildViroUserPrompt(question, previousInteractions, isHinglish);

    try {
      // Adapt prompts for Nova format
      const adaptedPrompt = PromptAdapter.adaptPrompt(
        systemPrompt,
        userPrompt,
        PromptUseCase.VIRO_ASSISTANT
      );

      // Invoke Bedrock with Nova Lite (cost-effective for conversational AI)
      const responseText = await this.bedrock!.invokeClaude(
        adaptedPrompt.messages,
        {
          model: ClaudeModel.NOVA_LITE,
          temperature: 0.8, // Higher temperature for more natural, varied responses
          maxTokens: 1000
        },
        adaptedPrompt.systemPrompt
      );

      // Parse the JSON response
      const parsedResponse = this.parseViroResponse(responseText);
      return parsedResponse;
    } catch (error) {
      console.error('Bedrock Viro Service Error:', error);
      // Fallback to hardcoded response on error
      return this.generateSocraticResponse_Internal(question, language, level, emotionalState, previousInteractions);
    }
  }

  /**
   * Build system prompt for Viro's Socratic teaching style
   */
  private buildViroSystemPrompt(isHinglish: boolean, level: string, emotionalState: string): string {
    const languageInstruction = isHinglish 
      ? 'Respond in Hinglish (mix of Hindi and English). Use Hindi words naturally mixed with English technical terms.'
      : 'Respond in clear, conversational English.';

    const emotionGuidance = this.getEmotionGuidance(emotionalState);

    return `You are Viro, an AI tutor who uses the Socratic method to help students learn programming concepts for technical interviews.

TEACHING PHILOSOPHY:
- NEVER give direct code solutions. Guide students to discover answers themselves.
- Use the RTF Framework: Recognize (acknowledge their question), Think (ask guiding questions), Fix (help them arrive at the solution)
- Use real-world analogies to make concepts relatable
- Adapt to student's emotional state and provide appropriate support

RESPONSE FORMAT - CRITICAL:
You MUST return ONLY a valid JSON object. No text before or after the JSON.
The JSON must have this EXACT structure:

{
  "acknowledge": "Acknowledge their question with enthusiasm/empathy",
  "question": "Ask a Socratic question that guides them to think deeper",
  "analogy": "Provide a real-world analogy (optional but encouraged)",
  "hint": "Give a subtle hint if they seem stuck (optional)",
  "action": "[ACTION: LEAN_FORWARD]",
  "emotion": "encouraging",
  "xpReward": 15
}

Valid actions: [ACTION: LEAN_FORWARD], [ACTION: GESTURE_EXPLAIN], [ACTION: NOD_SLOWLY], [ACTION: SMILE], [ACTION: POINT], [ACTION: GESTURE_CHAIN], [ACTION: STACK_GESTURE], [ACTION: GESTURE_LINE], [ACTION: THINK], [ACTION: NOD_SUPPORTIVE]

Valid emotions: neutral, encouraging, thoughtful, excited, patient, celebratory

LANGUAGE: ${languageInstruction}
STUDENT LEVEL: ${level}
EMOTIONAL STATE: ${emotionalState}
${emotionGuidance}

CRITICAL RULES:
1. Return ONLY valid JSON. Start with { and end with }. No markdown, no explanations, just JSON.
2. Never provide direct code solutions
3. Use analogies from Indian daily life (chai stalls, metro, cricket, etc.) when appropriate
4. Keep responses conversational and encouraging
5. Match the emotion to the student's state (${emotionalState})`;
  }

  /**
   * Get emotion-specific guidance for the AI
   */
  private getEmotionGuidance(emotionalState: string): string {
    switch (emotionalState) {
      case 'confused':
        return 'TONE: Be extra patient and supportive. Break down concepts into smaller pieces. Use simpler analogies.';
      case 'frustrated':
        return 'TONE: Be empathetic and encouraging. Acknowledge their struggle. Provide more direct hints while still being Socratic.';
      case 'curious':
        return 'TONE: Be enthusiastic and engaging. Challenge them with deeper questions. Encourage exploration.';
      case 'confident':
        return 'TONE: Be encouraging but challenging. Ask more advanced follow-up questions. Celebrate their understanding.';
      default:
        return 'TONE: Be warm and encouraging. Maintain a balanced approach.';
    }
  }

  /**
   * Build user prompt with context
   */
  private buildViroUserPrompt(question: string, previousInteractions: string[], isHinglish: boolean): string {
    let prompt = `Student's question: "${question}"`;
    
    if (previousInteractions.length > 0) {
      prompt += `\n\nPrevious conversation context:\n${previousInteractions.slice(-3).join('\n')}`;
      prompt += '\n\nBuild on this conversation naturally.';
    }

    return prompt;
  }

  /**
   * Parse Viro response from Bedrock
   */
  private parseViroResponse(responseText: string): ViroResponse {
    try {
      // Try to extract JSON from the response (handle cases where model adds extra text)
      let jsonText = responseText.trim();
      
      // If response doesn't start with {, try to find JSON in the text
      if (!jsonText.startsWith('{')) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('Raw response:', responseText);
          throw new Error('No JSON found in response');
        }
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);
      
      // Validate required fields
      if (!parsed.acknowledge || !parsed.question || !parsed.action || !parsed.emotion) {
        console.error('Parsed response missing fields:', parsed);
        throw new Error('Missing required fields in response');
      }

      // Validate emotion is one of the 6 allowed states
      const validEmotions: ViroEmotion[] = ['neutral', 'encouraging', 'thoughtful', 'excited', 'patient', 'celebratory'];
      if (!validEmotions.includes(parsed.emotion)) {
        console.warn(`Invalid emotion "${parsed.emotion}", defaulting to "encouraging"`);
        parsed.emotion = 'encouraging'; // Default fallback
      }

      return {
        acknowledge: parsed.acknowledge,
        question: parsed.question,
        analogy: parsed.analogy,
        hint: parsed.hint,
        action: parsed.action,
        emotion: parsed.emotion as ViroEmotion,
        xpReward: parsed.xpReward || 10
      };
    } catch (error) {
      console.error('Failed to parse Viro response:', error);
      console.error('Response text:', responseText);
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Detect if student is asking for direct code
   */
  private isAskingForDirectCode(question: string): boolean {
    const codeRequestPatterns = [
      /code for/i,
      /write.*code/i,
      /give.*code/i,
      /show.*code/i,
      /full.*code/i,
      /complete.*code/i,
      /solution.*code/i,
      /kya code/i,
      /code.*kaise/i,
      /code.*dikhao/i,
      /code.*do/i
    ];
    
    return codeRequestPatterns.some(pattern => pattern.test(question));
  }

  /**
   * Detect student's emotional state from question
   */
  private detectEmotionalState(question: string): 'confused' | 'frustrated' | 'curious' | 'confident' {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("don't get") || lowerQuestion.includes("don't understand") || 
        lowerQuestion.includes("samajh nahi") || lowerQuestion.includes("confus")) {
      return 'confused';
    }
    
    if (lowerQuestion.includes("still") || lowerQuestion.includes("again") || 
        lowerQuestion.includes("phir se") || lowerQuestion.includes("why not")) {
      return 'frustrated';
    }
    
    if (lowerQuestion.includes("how") || lowerQuestion.includes("why") || 
        lowerQuestion.includes("what if") || lowerQuestion.includes("kaise")) {
      return 'curious';
    }
    
    return 'confident';
  }

  /**
   * Generate refusal response when student asks for direct code
   */
  private generateRefusalResponse(question: string, language: string): ViroResponse {
    const isHinglish = language === 'hi' || language === 'hinglish';
    
    if (isHinglish) {
      return {
        acknowledge: "Main samajhta hoon ki aap code chahte hain, but let me tell you something important!",
        question: "Technical interviews mein logic aur reasoning test hota hai, not just code. Agar main aapko directly code de doon, toh aap interview mein kaise explain karoge? Let's start with the logic first - what's the main problem we're trying to solve here?",
        analogy: "Think of it like learning to drive - agar aap sirf steering wheel pakadna seekhoge without understanding traffic rules, toh road pe problem hogi na?",
        action: "[ACTION: LEAN_FORWARD]",
        emotion: "patient",
        xpReward: 5
      };
    }
    
    return {
      acknowledge: "I understand you want the code, but here's why I won't give it to you directly!",
      question: "In technical interviews, they test your logic and reasoning, not just your ability to write code. If I give you the solution now, how will you explain your thought process in an interview? Let's discover the logic together first - what's the core problem we need to solve?",
      analogy: "It's like learning to cook - if someone just gives you the dish, you won't know how to make it yourself when you need to.",
      action: "[ACTION: LEAN_FORWARD]",
      emotion: "patient",
      xpReward: 5
    };
  }

  /**
   * Generate Socratic response using RTF Framework
   */
  private generateSocraticResponse_Internal(
    question: string, 
    language: string, 
    level: string,
    emotionalState: string,
    previousInteractions: string[]
  ): ViroResponse {
    const lowerQuestion = question.toLowerCase();
    const isHinglish = language === 'hi' || language === 'hinglish';
    
    // Adjust tone based on emotional state
    const tone = emotionalState === 'confused' || emotionalState === 'frustrated' 
      ? 'supportive' 
      : 'encouraging';

    // Pattern matching for common topics
    if (lowerQuestion.includes('binary search')) {
      return this.getBinarySearchResponse(isHinglish, tone, level);
    }
    
    if (lowerQuestion.includes('recursion') || lowerQuestion.includes('recursive')) {
      return this.getRecursionResponse(isHinglish, tone, level);
    }
    
    if (lowerQuestion.includes('array')) {
      return this.getArrayResponse(isHinglish, tone, level);
    }
    
    if (lowerQuestion.includes('linked list')) {
      return this.getLinkedListResponse(isHinglish, tone, level);
    }
    
    if (lowerQuestion.includes('stack')) {
      return this.getStackResponse(isHinglish, tone, level);
    }
    
    if (lowerQuestion.includes('queue')) {
      return this.getQueueResponse(isHinglish, tone, level);
    }
    
    if (lowerQuestion.includes('time complexity') || lowerQuestion.includes('big o')) {
      return this.getTimeComplexityResponse(isHinglish, tone, level);
    }
    
    if (lowerQuestion.includes('pointer')) {
      return this.getPointerResponse(isHinglish, tone, level);
    }
    
    // Default Socratic response
    return this.getDefaultSocraticResponse(isHinglish, tone, emotionalState);
  }

  /**
   * Binary Search - Socratic Response
   */
  private getBinarySearchResponse(isHinglish: boolean, tone: string, level: string): ViroResponse {
    if (isHinglish) {
      return {
        acknowledge: "Binary Search! Bahut important algorithm hai interviews ke liye! 🎯",
        question: "Pehle mujhe batao - agar tumhare paas ek sorted phone directory hai aur tumhe kisi ka number dhundhna hai, toh kya tum page 1 se start karoge? Ya koi smarter way hai? Think about it!",
        analogy: "Dekho, it's exactly like finding a word in a dictionary. Tum middle page khol ke dekhte ho - agar word usse pehle hai toh left half mein dhundho, nahi toh right half mein. Simple!",
        hint: "Key insight: Har step mein search space half ho jata hai. Iska matlab kya hai time complexity ke liye?",
        action: "[ACTION: GESTURE_EXPLAIN]",
        emotion: "encouraging",
        xpReward: 15
      };
    }
    
    return {
      acknowledge: "Binary Search! That's a crucial algorithm for technical interviews! 🎯",
      question: "Let me ask you this first - if you had a sorted phone directory and needed to find someone's number, would you start from page 1? Or is there a smarter approach? Think about how you actually use a dictionary!",
      analogy: "It's exactly like finding a word in a dictionary - you open to the middle, check if your word comes before or after, then search only that half. You keep dividing until you find it!",
      hint: "Key insight: With each step, you're cutting the search space in half. What does this mean for time complexity?",
      action: "[ACTION: GESTURE_EXPLAIN]",
      emotion: "encouraging",
      xpReward: 15
    };
  }

  /**
   * Recursion - Socratic Response
   */
  private getRecursionResponse(isHinglish: boolean, tone: string, level: string): ViroResponse {
    if (tone === 'supportive') {
      if (isHinglish) {
        return {
          acknowledge: "Recursion thoda tricky lagta hai initially, but don't worry! Hum isko step-by-step samjhenge. 😊",
          question: "Pehle simple question - kabhi Russian nesting dolls (matryoshka) dekhe hain? Har doll ke andar ek chhoti doll hoti hai. Can you think of a coding problem jisme bhi same pattern ho - ek badi problem ke andar chhoti similar problems?",
          analogy: "Recursion is like those dolls - ek function apne aap ko call karta hai, but har baar thoda chhota problem ke saath. Jaise doll ke andar doll, function ke andar function!",
          hint: "Important: Agar stopping condition nahi hoga (base case), toh kya hoga? Infinite loop, right? So base case is crucial!",
          action: "[ACTION: NOD_SLOWLY]",
          emotion: "patient",
          xpReward: 15
        };
      }
      
      return {
        acknowledge: "Recursion can feel tricky at first, but don't worry! Let's break it down together. 😊",
        question: "Start with this - have you seen Russian nesting dolls (matryoshka)? Each doll contains a smaller version of itself. Can you think of a coding problem that has this same pattern - a big problem containing smaller similar problems?",
        analogy: "Recursion is like those dolls - a function calls itself, but each time with a smaller problem. Doll within doll, function within function!",
        hint: "Critical point: What happens if there's no stopping condition (base case)? Infinite loop, right? That's why the base case is crucial!",
        action: "[ACTION: NOD_SLOWLY]",
        emotion: "patient",
        xpReward: 15
      };
    }
    
    // Encouraging tone for curious students
    if (isHinglish) {
      return {
        acknowledge: "Great question! Recursion is one of the most elegant concepts in programming! ✨",
        question: "Let me challenge you - can you think of factorial? 5! = 5 × 4 × 3 × 2 × 1. But notice: 5! = 5 × (4!). Aur 4! = 4 × (3!). Pattern dikh raha hai? How would you express this in code logic?",
        analogy: "It's like a tower of blocks - to know the height of the tower, you need to know the height of the tower below it, plus one more block!",
        hint: "Two parts chahiye: (1) Base case - jab recursion stop ho, (2) Recursive case - function apne aap ko kaise call kare.",
        action: "[ACTION: SMILE]",
        emotion: "excited",
        xpReward: 20
      };
    }
    
    return {
      acknowledge: "Great question! Recursion is one of the most elegant concepts in programming! ✨",
      question: "Let me challenge you - think about factorial. 5! = 5 × 4 × 3 × 2 × 1. But notice: 5! = 5 × (4!). And 4! = 4 × (3!). See the pattern? How would you express this relationship in code?",
      analogy: "It's like a tower of blocks - to know the height of the tower, you need to know the height of the tower below it, plus one more block!",
      hint: "You need two parts: (1) Base case - when to stop, (2) Recursive case - how the function calls itself with a smaller problem.",
      action: "[ACTION: SMILE]",
      emotion: "excited",
      xpReward: 20
    };
  }

  /**
   * Array - Socratic Response
   */
  private getArrayResponse(isHinglish: boolean, tone: string, level: string): ViroResponse {
    if (isHinglish) {
      return {
        acknowledge: "Arrays! Ye toh foundation hai data structures ka! 💪",
        question: "Imagine karo - tumhare paas ek row of lockers hai, numbered 0 se 9 tak. Har locker mein ek item store hai. Agar mujhe 5th locker ka item chahiye, toh kitna time lagega? Aur why is it so fast?",
        analogy: "Array is exactly like a row of lockers in a gym - har locker ka number (index) hai, aur tum directly us number pe ja sakte ho. No searching needed!",
        hint: "Key point: Direct access using index. Iska matlab time complexity O(1) hai for accessing any element!",
        action: "[ACTION: POINT]",
        emotion: "encouraging",
        xpReward: 10
      };
    }
    
    return {
      acknowledge: "Arrays! That's the foundation of data structures! 💪",
      question: "Imagine you have a row of lockers, numbered 0 to 9. Each locker stores one item. If I need the item in the 5th locker, how long does it take? And why is it so fast?",
      analogy: "An array is exactly like a row of lockers in a gym - each locker has a number (index), and you can go directly to that number. No searching needed!",
      hint: "Key point: Direct access using index. This means O(1) time complexity for accessing any element!",
      action: "[ACTION: POINT]",
      emotion: "encouraging",
      xpReward: 10
    };
  }

  /**
   * Linked List - Socratic Response
   */
  private getLinkedListResponse(isHinglish: boolean, tone: string, level: string): ViroResponse {
    if (isHinglish) {
      return {
        acknowledge: "Linked List! Interesting data structure hai! 🚂",
        question: "Socho - ek train hai jisme har coach next coach ko point karta hai. Agar tumhe 5th coach mein jaana hai, toh kya tum directly jump kar sakte ho? Ya pehle 1st, 2nd, 3rd, 4th se hoke jaana padega?",
        analogy: "Linked List is like a train - har coach (node) next coach ka address rakhta hai. Unlike array (lockers), tum directly kisi bhi position pe nahi ja sakte. You have to traverse!",
        hint: "Arrays mein direct access O(1), but Linked List mein traverse karna padta hai O(n). But insertion/deletion mein Linked List fast hai. Why?",
        action: "[ACTION: GESTURE_CHAIN]",
        emotion: "thoughtful",
        xpReward: 15
      };
    }
    
    return {
      acknowledge: "Linked List! That's an interesting data structure! 🚂",
      question: "Think of a train where each coach points to the next coach. If you need to reach the 5th coach, can you jump directly there? Or do you have to go through 1st, 2nd, 3rd, 4th first?",
      analogy: "A Linked List is like a train - each coach (node) holds the address of the next coach. Unlike an array (lockers), you can't jump directly to any position. You must traverse!",
      hint: "Arrays have O(1) direct access, but Linked Lists require O(n) traversal. However, Linked Lists are faster for insertion/deletion. Why is that?",
      action: "[ACTION: GESTURE_CHAIN]",
      emotion: "thoughtful",
      xpReward: 15
    };
  }

  /**
   * Stack - Socratic Response
   */
  private getStackResponse(isHinglish: boolean, tone: string, level: string): ViroResponse {
    if (isHinglish) {
      return {
        acknowledge: "Stack! Ye toh bahut useful hai function calls aur undo operations ke liye! 📚",
        question: "Imagine karo - tumhare paas plates ka stack hai. Naya plate kahan add hoga? Top pe, right? Aur jab plate nikalni hai, toh kahan se nikaloge? Again top se! Isko kya kehte hain?",
        analogy: "Stack is exactly like a stack of plates in a dhaba - Last In, First Out (LIFO). Jo plate last mein rakhi, wahi pehle nikalti hai!",
        hint: "Real-world use: Browser back button, undo in text editor, function call stack. Sab LIFO principle follow karte hain!",
        action: "[ACTION: STACK_GESTURE]",
        emotion: "encouraging",
        xpReward: 12
      };
    }
    
    return {
      acknowledge: "Stack! That's super useful for function calls and undo operations! 📚",
      question: "Imagine you have a stack of plates. Where do you add a new plate? On top, right? And when you need to remove a plate, where do you take it from? Again from the top! What do we call this principle?",
      analogy: "A Stack is exactly like a stack of plates in a restaurant - Last In, First Out (LIFO). The plate you placed last is the first one you remove!",
      hint: "Real-world uses: Browser back button, undo in text editors, function call stack. All follow the LIFO principle!",
      action: "[ACTION: STACK_GESTURE]",
      emotion: "encouraging",
      xpReward: 12
    };
  }

  /**
   * Queue - Socratic Response
   */
  private getQueueResponse(isHinglish: boolean, tone: string, level: string): ViroResponse {
    if (isHinglish) {
      return {
        acknowledge: "Queue! Ye toh daily life mein har jagah dikhta hai! 🚶‍♂️",
        question: "Metro station pe ticket counter ka line socho. Jo pehle aaya, usko pehle ticket milti hai, right? Agar tum last mein aaye, toh tumhe kab milegi? Last mein! Isko kya principle kehte hain?",
        analogy: "Queue is like a line at a chai stall - First In, First Out (FIFO). Jo pehle line mein aaya, usko pehle chai milti hai. Fair system!",
        hint: "Real-world use: Print queue, task scheduling, BFS algorithm. Sab FIFO follow karte hain!",
        action: "[ACTION: GESTURE_LINE]",
        emotion: "encouraging",
        xpReward: 12
      };
    }
    
    return {
      acknowledge: "Queue! You see this everywhere in daily life! 🚶‍♂️",
      question: "Think of a ticket counter line at a metro station. Who gets served first? The person who came first, right? If you arrive last, when do you get served? Last! What principle is this?",
      analogy: "A Queue is like a line at a tea stall - First In, First Out (FIFO). The person who joined the line first gets served first. Fair system!",
      hint: "Real-world uses: Print queue, task scheduling, BFS algorithm. All follow FIFO!",
      action: "[ACTION: GESTURE_LINE]",
      emotion: "encouraging",
      xpReward: 12
    };
  }

  /**
   * Time Complexity - Socratic Response
   */
  private getTimeComplexityResponse(isHinglish: boolean, tone: string, level: string): ViroResponse {
    if (isHinglish) {
      return {
        acknowledge: "Time Complexity! Ye toh interviews ka favorite topic hai! ⏱️",
        question: "Simple question - agar tumhe ek library mein book dhundhni hai, toh kaunsa faster hoga: (1) Har shelf check karna, ya (2) Catalog system use karna? Aur jab library badi ho jaye (10x books), toh time kitna badh jayega dono methods mein?",
        analogy: "Time complexity measures kaise algorithm ka time badhta hai jab input size badhta hai. It's like measuring traffic - 10 cars vs 1000 cars, time difference kitna hoga?",
        hint: "O(1) = constant, O(n) = linear, O(log n) = logarithmic, O(n²) = quadratic. Smaller is better!",
        action: "[ACTION: THINK]",
        emotion: "thoughtful",
        xpReward: 20
      };
    }
    
    return {
      acknowledge: "Time Complexity! That's a favorite interview topic! ⏱️",
      question: "Simple question - if you need to find a book in a library, which is faster: (1) Checking every shelf, or (2) Using the catalog system? And when the library grows 10x, how much more time does each method take?",
      analogy: "Time complexity measures how an algorithm's time grows as input size increases. It's like measuring traffic - 10 cars vs 1000 cars, what's the time difference?",
      hint: "O(1) = constant, O(n) = linear, O(log n) = logarithmic, O(n²) = quadratic. Smaller is better!",
      action: "[ACTION: THINK]",
      emotion: "thoughtful",
      xpReward: 20
    };
  }

  /**
   * Pointer - Socratic Response
   */
  private getPointerResponse(isHinglish: boolean, tone: string, level: string): ViroResponse {
    if (isHinglish) {
      return {
        acknowledge: "Pointers! Ye C/C++ ka most powerful concept hai! 🎯",
        question: "Socho - tumhare paas ek address hai (like '123 MG Road, Bangalore'). Ye address kya hai? Ek location ka reference, right? Pointer bhi exactly same hai - it stores the memory address of another variable. Agar main tumhe address doon, toh tum us location pe ja sakte ho. Make sense?",
        analogy: "Pointer is like a GPS coordinate - it doesn't contain the actual house, but it tells you WHERE the house is located. You can use that address to reach the house!",
        hint: "Key concept: Pointer stores address (using &), aur us address pe value access karne ke liye * use karte hain (dereferencing).",
        action: "[ACTION: POINT]",
        emotion: "patient",
        xpReward: 18
      };
    }
    
    return {
      acknowledge: "Pointers! That's the most powerful concept in C/C++! 🎯",
      question: "Think about this - you have an address (like '123 MG Road, Bangalore'). What is that address? A reference to a location, right? A pointer is exactly the same - it stores the memory address of another variable. If I give you an address, you can go to that location. Make sense?",
      analogy: "A pointer is like a GPS coordinate - it doesn't contain the actual house, but it tells you WHERE the house is located. You use that address to reach the house!",
      hint: "Key concept: Pointer stores address (using &), and to access the value at that address, you use * (dereferencing).",
      action: "[ACTION: POINT]",
      emotion: "patient",
      xpReward: 18
    };
  }

  /**
   * Default Socratic Response
   */
  private getDefaultSocraticResponse(isHinglish: boolean, tone: string, emotionalState: string): ViroResponse {
    if (emotionalState === 'confused' || emotionalState === 'frustrated') {
      if (isHinglish) {
        return {
          acknowledge: "Main samajh sakta hoon ki ye confusing lag raha hai. Don't worry, hum isko together solve karenge! 💪",
          question: "Pehle mujhe batao - is topic ke baare mein tumhe kya pata hai already? Aur exactly kaunsa part confusing hai? Let's break it down step by step!",
          hint: "Remember: Har complex problem chhote simple problems mein break ho sakta hai. Let's start with the basics!",
          action: "[ACTION: NOD_SUPPORTIVE]",
          emotion: "patient",
          xpReward: 10
        };
      }
      
      return {
        acknowledge: "I can see this is confusing. Don't worry, we'll work through this together! 💪",
        question: "First, tell me - what do you already know about this topic? And which specific part is confusing you? Let's break it down step by step!",
        hint: "Remember: Every complex problem can be broken into smaller, simpler problems. Let's start with the basics!",
        action: "[ACTION: NOD_SUPPORTIVE]",
        emotion: "patient",
        xpReward: 10
      };
    }
    
    // Default encouraging response
    if (isHinglish) {
      return {
        acknowledge: "Great question! Main dekh sakta hoon ki tum soch rahe ho! 🌟",
        question: "Pehle mujhe batao - is problem ko solve karne ke liye tumhe kya steps lenge? Agar tum isko kisi friend ko explain karte, toh kaise explain karte? Think out loud!",
        analogy: "Problem-solving is like cooking - pehle ingredients identify karo, then steps plan karo, then execute karo!",
        action: "[ACTION: SMILE]",
        emotion: "encouraging",
        xpReward: 10
      };
    }
    
    return {
      acknowledge: "Great question! I can see you're thinking critically! 🌟",
      question: "First, tell me - what steps would you take to solve this problem? If you were explaining this to a friend, how would you break it down? Think out loud!",
      analogy: "Problem-solving is like cooking - first identify ingredients, then plan the steps, then execute!",
      action: "[ACTION: SMILE]",
      emotion: "encouraging",
      xpReward: 10
    };
  }

  /**
   * Generate mock response (legacy method, kept for backward compatibility)
   */
  private generateMockResponse(question: string, language: string, level: string): ViroResponse {
    // Redirect to new RTF Framework method
    return this.generateSocraticResponse_Internal(question, language, level, 'curious', []);
  }

  /**
   * Detect if student is using Hinglish
   */
  detectLanguage(text: string): 'en' | 'hi' | 'hinglish' {
    // Simple detection: check for Devanagari script or common Hinglish patterns
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const hinglishPatterns = /\b(mujhe|kya|hai|nahi|samajh|kaise|kya|aur|ya|matlab)\b/i;
    
    if (hasDevanagari) return 'hi';
    if (hinglishPatterns.test(text)) return 'hinglish';
    return 'en';
  }

  /**
   * Estimate student level based on question complexity
   */
  estimateStudentLevel(question: string): 'beginner' | 'intermediate' | 'advanced' {
    const beginnerKeywords = ['what is', 'how to', 'basic', 'simple', 'start', 'begin'];
    const advancedKeywords = ['optimize', 'complexity', 'algorithm', 'design pattern', 'architecture'];
    
    const lowerQuestion = question.toLowerCase();
    
    if (advancedKeywords.some(keyword => lowerQuestion.includes(keyword))) {
      return 'advanced';
    }
    if (beginnerKeywords.some(keyword => lowerQuestion.includes(keyword))) {
      return 'beginner';
    }
    return 'intermediate';
  }

  /**
   * Get common analogies for programming concepts
   */
  getAnalogy(concept: string): string | undefined {
    const analogies: Record<string, string> = {
      'array': 'Think of an array like a row of lockers - each has a number and stores one item.',
      'linked list': 'Imagine a train where each coach is connected to the next one.',
      'stack': 'Like a stack of plates - you can only add or remove from the top.',
      'queue': 'Like a line at a chai stall - first person in line gets served first.',
      'recursion': 'Like Russian nesting dolls - each contains a smaller version of itself.',
      'binary search': 'Like finding a word in a dictionary - you open to the middle and decide which half to search.',
      'hash table': 'Like a phone directory - you can quickly find someone by their name.',
      'tree': 'Like a family tree - one ancestor at the top, branches to descendants.',
      'graph': 'Like a railway network - stations (nodes) connected by tracks (edges).',
      'sorting': 'Like organizing cricket cards by player number.',
    };

    const lowerConcept = concept.toLowerCase();
    for (const [key, value] of Object.entries(analogies)) {
      if (lowerConcept.includes(key)) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Calculate XP reward based on interaction quality
   */
  calculateXPReward(
    questionComplexity: 'simple' | 'moderate' | 'complex',
    studentProgress: 'stuck' | 'progressing' | 'breakthrough'
  ): number {
    const baseXP = {
      simple: 10,
      moderate: 15,
      complex: 20
    };

    const progressMultiplier = {
      stuck: 1.0,
      progressing: 1.2,
      breakthrough: 1.5
    };

    return Math.round(baseXP[questionComplexity] * progressMultiplier[studentProgress]);
  }
}

export const viroService = new ViroService();
