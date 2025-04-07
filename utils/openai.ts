import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing env.OPENAI_API_KEY');
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export async function generateTodoSuggestions(userHistory: any[]) {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that suggests daily tasks based on user history. Provide 3-5 relevant tasks.'
                },
                {
                    role: 'user',
                    content: `Based on this user's task history: ${JSON.stringify(userHistory)}, suggest some tasks for today.`
                }
            ],
            temperature: 0.7,
            max_tokens: 200
        });

        const suggestions = completion.choices[0]?.message?.content;
        return suggestions ? suggestions.split('\n').filter(Boolean) : [];
    } catch (error) {
        console.error('Error generating todo suggestions:', error);
        return [];
    }
}