const app = require('express');
const router = app.Router();
const {User,Post,Comment,CommentLike, sequelize} = require('../../models');
const authMiddleware = require('../auth/authMiddleware');
const { Op } = require('sequelize');

//커뮤니티 리스트 관련
router.get('/',async(req,res)=>{
    const {fish_type,keyword} = req.query;
    let where = {};
    const selectedFishTypes = fish_type ? 
                            Array.isArray(fish_type) ? 
                            fish_type :
                            [fish_type] 
                            : 
                            [];
    
    if(keyword){
        where.title = {
            [Op.like] : `%${keyword}%`
        };
    }

    if (selectedFishTypes.length > 0){
        where.fish_type={
            [Op.in]: selectedFishTypes
        }
    }
    let datas = await Post.findAll({
        where,
        attributes:['post_id','title','fish_type'],
        include:{model:User,attributes:['nickname']}
    });
    console.log(fish_type);
    res.render('communicationList',{datas,selectedFishTypes,keyword});
})

router.get('/mypost',authMiddleware,async(req,res)=>{
    try {
        const {fish_type} = req.query;
        const {user_id} = req.user;
        let where = {}
        const selectedFishTypes = fish_type ? 
                            Array.isArray(fish_type) ? 
                            fish_type :
                            [fish_type] 
                            : 
                            [];
        if (selectedFishTypes.length > 0){
            where.fish_type={
                [Op.in]: selectedFishTypes
            }
        }
        where.user_id = user_id;
        const datas = await Post.findAll({
            where,
            attributes:['post_id','title','fish_type'],
            include:{model:User,attributes:['nickname']}
        })
        return res.render('myCommunity',{datas,selectedFishTypes});
    } catch (error) {
        return res.send(`
            <script>
                alert("오류가 발생하였습니다.")
                window.location.href = "/api/community"
            </script>
            `)
    }
})


//게시글 작성 관련
router.get('/posts',authMiddleware,async(req,res)=>{
    const nickname = req.user.nickname;
    res.render('newCommunicate',{nickname});

})

router.post('/posts',authMiddleware,async (req,res) => {
    try {
        const {title,fish_type,content} = req.body;
        const id = req.user.user_id;
        const data = await Post.create({
            title,
            user_id:id,
            fish_type,
            content
        })
        res.redirect('/api/community');   
    } catch (error) {
        
    }
})

//개인 게시글 정보
router.get('/posts/:id',authMiddleware,async(req,res)=>{
    try {
        const {id} = req.params;
        const {user_id} = req.user;
        const data = await Post.findOne({where:{post_id:id},
            include:[
                {model:User,attributes:['user_id','nickname']}
            ]});
        const commentDatas = await Comment.findAll({
            where:{post_id:id,parent_id:null},
            attributes:{
                include:[
                    [
                        sequelize.fn(
                            'COUNT',
                            sequelize.col('CommentLikes.commentlike_id')
                            ),
                            'likeCount'
                    ]
                ]
            },
            include:[
                {model:User,attributes:['nickname']},
                {model:CommentLike,attributes:[]},
            ],
            group:[
                'Comment.comment_id',
                'User.user_id',
            ],
            order:[['created_at','ASC']]
        })
        const replyData = await Comment.findAll({
            where:{
                post_id:id,parent_id:{
                    [Op.ne]:null
                }
            },
            attributes:{
                include:[
                    [
                        sequelize.fn(
                            'COUNT',
                            sequelize.col('CommentLikes.commentlike_id')
                            ),
                            'likeCount'
                    ]
                ]
            },
            include:[
                {model:User,attributes:['nickname']},
                {model:CommentLike,attributes:[]},
            ],
            group:[
                'Comment.comment_id',
                'User.user_id',
            ],
            order:[['created_at','ASC']]
        })
        const mine = user_id === data.User.user_id;
        return res.render('communicateInfo',{data,mine,user_id,commentDatas,replyData});
    } catch (error) {
        console.error(error);
        return res.send(`
            <script>
                alert("존재하지 않는 게시글입니다.")
                window.location.href = "/api/communicate"
            </script>
            `)
    }
})

//게시글 업데이트
router.get('/update/:id',authMiddleware,async(req,res)=>{
    const {id} = req.params;
    try {
        const data = await Post.findOne({where:{post_id:id},include:[{model:User}]});
        if(!data){
            throw new Error('존재하지 않는 데이터입니다.')
        }
        if(data.User.user_id !== req.user.user_id){
            throw new Error('해당 페이지의 권한이 없습니다.')
        }
        res.render('UpdatePost',{data});
    } catch (error) {
        res.send(`
            <script>
                alert('${error.message}');
                window.location.href = '/api/community'
            </script>
            `)
    }
})

router.post('/update/:id',authMiddleware,async(req,res)=>{
    const {id} = req.params;
    try {
        const data = await Post.findOne({where:{post_id:id},include:[{model:User}]});
        if(!data){
            throw new Error('존재하지 않는 데이터입니다.')
        }
        if(data.User.user_id !== req.user.user_id){
            throw new Error('해당 페이지의 권한이 없습니다.')
        }
        const {title,fish_type,content} = req.body;
        await Post.update({
            title,
            fish_type,
            content
        },{
            where: { post_id: id }
        })
        res.redirect('/api/community');
    } catch (error) {
        res.send(`
            <script>
                alert('${error.message}');
                window.location.href = '/api/community'
            </script>
            `)
    }
})

//댓글
router.post('/comment',authMiddleware,async(req,res)=>{
    try {
        const userId = req.user.user_id;
        const {post_id,content,commentId}  = req.body;
        console.log(commentId);
        const updatedData = await Comment.create({
            post_id,
            parent_id: commentId || null,
            user_id:userId,
            content
        })
        console.log(req.body);
        res.redirect(`/api/community/posts/${post_id}`);
    } catch (error) {
        res.send(`
            <script>
                alert('${error.message}');
                window.location.href = '/api/community'
            </script>
            `)
    }
})


router.post('/comment/:id',authMiddleware,async(req,res)=>{
    try {
        const{content} = req.body;
        const {user_id} = req.user;
        const {id} = req.params;
        const data = await Comment.findOne({where:{comment_id:id}})
        if(data){
            await data.update({content});
        }else{
            throw new Error('댓글 변경에 오류가 발생하였습니다.')
        }
        res.redirect(`/api/community/posts/${data.post_id}`);   
    } catch (error) {
        res.send(`
            <script>
                alert('${error.message}');
                window.location.href = '/api/community'
            </script>
            `)
    }

})


router.post('/commentLike/:id',authMiddleware,async(req,res)=>{
    try {
        console.log('들어옴');
        const {id} = req.params;
        const userId = req.user.user_id;
        const {post_id} = req.body;
        const exLikeUser = await CommentLike.findOne({
            where:{
                user_id:userId,
                comment_id:id
            }})
        if(exLikeUser){
            await CommentLike.destroy({
                where:{
                    user_id:userId,
                    comment_id:id
                }
            })
        }else{
            await CommentLike.create({
                user_id:userId,
                comment_id:id
            })
        }
        res.redirect(`/api/community/posts/${post_id}`)
;    } catch (error) {
        
    }
})


//게시글 삭제
router.delete('/posts/:id',authMiddleware,async(req,res)=>{
    console.log('들어감');
    try {
        const {id} = req.params;
        const post = await Post.findOne({where:{post_id:id}})
        if(req.user.user_id !== post.user_id){
            const err = new Error('제거할 권한이 없습니다.')
            err.status = 403;
            throw err;
        }   
        const result = await Post.destroy({where:{post_id:id}});
        console.log(result);
        res.redirect('/api/community');
    } catch (error) {
        let message = error.message;
        res.json({message});
    }
})

router.post('/deletecomment/:id',authMiddleware,async(req,res)=>{
    try {
        const {id} = req.params;
        const comment = await Comment.findOne({where:{comment_id:id}});
        if(req.user.user_id !== comment.user_id){
            throw new Error('제거할 권한이 없습니다.');
        }
        await comment.update({
            content:'삭제된 댓글입니다.'
        });
        res.redirect(`/api/community/posts/${comment.post_id}`);
    } catch (error) {
        res.send(`
            <script>
                alert('${error.message}');
                window.location.href = '/api/community'
            </script>
            `)
    }
})

module.exports = router;