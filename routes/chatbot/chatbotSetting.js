const {GoogleGenAI} = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey:process.env.chatbot_apiKey
})

const GenerateResponse = async(question) =>{
    const response = await ai.models.generateContent({
        model:'gemini-3.5-flash',
        config:{
            systemInstruction:
            `너는 관상어와 어항 관리 전문 챗봇이다.
            물고기와 어항 관리에 관련된 질문에만 답변한다.
            답변은 한국어로 쉽고 간단하게 작성한다.

            정확한 답변에 정보가 부족하면
            물고기 종류, 증상, 수온, 수질 등을 추가로 질문한다.

            사용자가 이미 제공한 정보는 다시 질문하지 않는다.

            질병을 확정적으로 진단하지 않는다.
            위험한 증상이 있으면 수산질병관리사나 전문가의 상담을 권한다.`
        },
        contents:question.trim()
    })
    return response.text;
}


module.exports = {GenerateResponse}