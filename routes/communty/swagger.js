

module.exports = {
    '/api/community/list':{
        get:{
            tags:['Community'],
            summary: '커뮤니티 리스트 출력',
            description: 'DB에 저장되어 있는 게시글 리스트를 조회합니다',
            security: [{ bearerAuth: []}],
            parameters:[
                {
                    in: 'query',
                    name: ['fish_type', 'keyword'],
                    
                }
            ]
        }
    }
}