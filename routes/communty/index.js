const app = require('express');
const router = app.Router();
const {User,Post,Comment,CommentLike,Image} = require('../../models');
const authMiddleware = require('../auth/authMiddleware');
const { Op,fn,col } = require('sequelize');
const devAuthMiddleware = require('../auth/devauthMiddleware');
const upload = require('../uploaded/profileupload');
const fs = require('fs');
const path = require('path');


//커뮤니티 리스트 관련
router.get('/list',async (req,res) => {
    try {
        const {fish_type,keyword} = req.query;
        let where = {};
        const selectedFishTypes = fish_type ?
                                Array.isArray(fish_type) ?
                                fish_type : [fish_type]
                                : [];
        if(keyword){
            where.title = {
                [Op.like]: `${keyword}`
            };
        }
        if(selectedFishTypes.length > 0){
            where.fish_type = {
                [Op.in]: selectedFishTypes
            }
        }

        let datas = await Post.findAll({
            where,
            attributes:['post_id','title','content','fish_type'],
            include:{model:User,attributes:['nickname']},
            order: [['created_at', 'DESC']]
        });

        console.log(datas);
        res.json({selectedFishTypes,datas,keyword});
    } catch (error) {
        console.error(error);
        return res.status(error.status||500).json({message:'게시글을 불러오지 못했습니다.'})
    }
})

//내가 작성한 게시글 확인
router.get('/mypost/data',devAuthMiddleware,async(req,res)=>{
    const {fish_type,keyword} = req.query;
    let where = {}
    const selectedFishTypes = fish_type ? 
                            Array.isArray(fish_type) ? 
                            fish_type : [fish_type] :
                            [];

    if(keyword){
        where.title ={
            [Op.like] : `%${keyword}%`
        }
    }
    if(selectedFishTypes.length > 0){
        where.fish_type={
            [Op.in] : selectedFishTypes
        }
    }
    try {
        where.user_id = req.user.user_id;
        const datas = await Post.findAll({
            where,
            attributes:['post_id','title','fish_type'],
            include:{model:User,attributes:['nickname']}
        })
        return res.json({datas,selectedFishTypes,keyword});
    } catch (error) {
        console.log(error);
        res.json({message:'게시글을 불러오지 못하였습니다.'})
    }
    
})


//게시글 작성 관련
router.post('/posts',authMiddleware,upload.array('images',4),async (req,res) => {
    try {
        const {title,fish_type,content} = req.body;
        const id = req.user.user_id;
        const data = await Post.create({
            title,
            user_id:id,
            fish_type,
            content
        })
        const files = req.files ?? [];
        console.log(files);
        if(files.length > 0){
            await Image.bulkCreate(
                files.map((prev)=>({
                    post_id:data.post_id,
                    Image_url:`/uploads/post/${prev.filename}`
                }))
            )
        }

        return res.status(200).json(data);   
    } catch (error) {
        console.log(error);
        res.status(error.status||500).json({message:error.message||'에러가 발생하였습니다.'})
    }
})

//개인 게시글 정보

router.get('/posts/:id',authMiddleware,async (req,res) => {
    try {
        const {id} = req.params;
        const {user_id} = req.user;
        const Postdata = await Post.findOne({
            where:{
                post_id:id
            },
            include:[
                {model:User,attributes:['user_id','nickname']}
            ]
        })
        const commentDatas = await Comment.findAll({
            where:{post_id:id,parent_id:null},
            attributes:{
                include:[
                    [
                        fn(
                            'COUNT',
                            col('CommentLikes.commentlike_id')
                            ),
                            'likeCount'
                    ]
                ]
            },
            include:[
                {model:User,attributes:['user_id','nickname']},
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
                        fn(
                            'COUNT',
                            col('CommentLikes.commentlike_id')
                            ),
                            'likeCount'
                    ]
                ]
            },
            include:[
                {model:User,attributes:['user_id','nickname']},
                {model:CommentLike,attributes:[]},
            ],
            group:[
                'Comment.comment_id',
                'User.user_id',
            ],
            order:[['created_at','ASC']]
        })
        const images = await Image.findAll({
            where:{
                post_id:id
            }
        })
        const mine = user_id === Postdata.user_id;
        res.json({mine,replyData,commentDatas,Postdata,images})
    } catch (error) {
        console.log(error);
        res.json({message:'오류가 발생하였습니다.'})
    }
})

//게시글 업데이트

router.get('/update/:id',devAuthMiddleware,async(req,res)=>{
    const {id} = req.params;
    try {
        const Postdata = await Post.findOne({where:{post_id:id},include:[{model:User}]});
        if(!Postdata){
            const err = new Error('존재하지 않는 데이터입니다.');
            err.status = 404;
            throw err;
        }
        if(Postdata.user_id !== req.user.user_id){
            const err = new Error('해당 페이지의 권한이 없습니다.');
            err.status = 403;
            throw err;
        }
        const image = await Image.findAll({where:{post_id:id}});
        return res.status(200).json({Postdata,image});
    } catch (error) {
        return res.status(error.status || 500).json({
            message:error.message
        })
    }
})

router.post('/update/:id',devAuthMiddleware,upload.array('images',4),async(req,res)=>{
    const {id} = req.params;
    const images = req.files || [];
    console.log(images);
    let deleteImageId = req.body.deleteImageId || [];
    try {
        const data = await Post.findOne({where:{post_id:id},include:[{model:User}]});
        if(!data){
            throw new Error('존재하지 않는 데이터입니다.')
        }
        if(data.user_id !== req.user.user_id){
            throw new Error('해당 페이지의 권한이 없습니다.')
        }
        if (typeof deleteImageId === "string") {
        try {
            deleteImageId = JSON.parse(deleteImageId);
        } catch (e) {
            deleteImageId = [Number(deleteImageId)];
        }
        }

        if (!Array.isArray(deleteImageId)) {
            deleteImageId = [deleteImageId];
        }

        deleteImageId = deleteImageId.map(Number);
        const currentImageCount = await Image.count({
            where:{post_id:id}
        })
        const deleteImage = deleteImageId.length > 0 ? await Image.findAll({where:{Image_id:deleteImageId,post_id:id}}):[];
        const fileCount = currentImageCount - deleteImage.length + images.length
        if(fileCount > 4){
            await Promise.all(
                images.map(async image => {
                    try {
                        await fs.promises.unlink(image.path);
                    } catch (error) {
                        if (error.code !== 'ENOENT') {
                            console.error(error);
                        }
                    }
                })
            )
            return res.status(400).json({
                message:'한 게시글에 저장할 수 있는 이미지에 갯수는 4개만 가능합니다.'
            })
        } 
        
        await Promise.all(
            deleteImage.map(async image=>{
                try {
                    await fs.promises.unlink(path.join(__dirname,'../..',image.Image_url));
                }  catch (err) {
                    if (err.code !== 'ENOENT') {
                        throw err
                    }
                }
            })
        )
        await Image.destroy({
            where:{Image_id:deleteImageId,post_id:id}
        })
        
        if(images.length > 0){
            await Image.bulkCreate(
                images.map(image=>({
                    post_id:id,
                    Image_url:`/uploads/post/${image.filename}`
                }))
            )
            
        }

        const {title,fish_type,content} = req.body;
        await Post.update({
            title,
            fish_type,
            content
        },{
            where: { post_id: id }
        })
        return res.status(204).send()
    } catch (error) {
        return res.status(error.status||500).json({message:error.message||'서버에 문제가 발생하였습니다.'})
    }
})

//댓글
router.post('/comment',devAuthMiddleware,async(req,res)=>{
    try {
        const userId = req.user.user_id;
        const {post_id,content,commentId}  = req.body;
        const updatedData = await Comment.create({
            post_id,
            parent_id: commentId || null,
            user_id:userId,
            content
        })
        return res.status(200).json(updatedData);
    } catch (error) {
        console.log(error);
        res.status(error.status||500).json({message:error.message||'서버에 오류가 발생하였습니다.'})
    }
})


router.post('/comment/:id',devAuthMiddleware,async(req,res)=>{
    try {
        const content = req.body.update;
        console.log(req.body);
        const {user_id} = req.user;
        const {id} = req.params;
        const data = await Comment.findOne({where:{comment_id:id}})
        if(data){
            await data.update({content});
        }else{
            throw new Error('댓글 변경에 오류가 발생하였습니다.')
        }
        return res.status(204).send();
    } catch (error) {
        return res.status(error.status).json({messgae:error.message||'에러가 발생하였습니다.'})
    }

})


router.post('/commentLike/:id',devAuthMiddleware,async(req,res)=>{
    try {
        console.log('들어옴');
        const {id} = req.params;
        const userId = req.user.user_id;
        let like; 
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
            like = true;
        }else{
            await CommentLike.create({
                user_id:userId,
                comment_id:id
            })
            like = false
        }
        return res.status(200).json({like});        
;    } catch (error) {
        return res.status(error.status||500).json({message:error.message||'서버에 오류가 발생하였습니다.'});
    }
})


//게시글 삭제
router.delete('/posts/:id',devAuthMiddleware,async(req,res)=>{
    console.log('들어감');
    try {
        const {id} = req.params;
        const post = await Post.findOne({where:{post_id:id}})
        if(!post){
            const err = new Error('게시글이 존재하지 않습니다.')
            err.status = 404;
            throw err;
        }
        if(req.user.user_id !== post.user_id){
            const err = new Error('제거할 권한이 없습니다.')
            err.status = 403;
            throw err;
        }
        const images = await Image.findAll({where:{post_id:id}});
        if(images.length > 0){
            await Promise.all(
                images.map(async image => {
                    const img = path.join(__dirname,'../../',image.Image_url);
                    try {
                        await fs.promises.unlink(img);
                    } catch (error) {
                        if (error.code !== 'ENOENT') {
                            console.error(error);
                        }
                    }
                })
            )
        }
        const result = await Post.destroy({where:{post_id:id}});
        //삭제 실패
        if(!result){
            const error = new Error('제거에 실패하였습니다.')
            error.status = 404;
            throw error;
        }
        return res.sendStatus(204);
    } catch (error) {
        return res.status(error.status||500).json({message:error.message||'서버 오류가 발생하였습니다'});
    }
})

router.post('/deletecomment/:id',devAuthMiddleware,async(req,res)=>{
    try {
        const {id} = req.params;
        const comment = await Comment.findOne({where:{comment_id:id}});
        if(!comment){
            const error = new Error('삭제할 댓글이 보이지 않습니다.')
            error.status = 404;
            throw error
        }
        if(Number(req.user.user_id) !== Number(comment.user_id)){
            throw new Error('제거할 권한이 없습니다.');
        }
        await comment.update({
            content:'삭제된 댓글입니다.',is_deleted:true
        });
        return res.status(200).json({message:'제거 성공'})
    } catch (error) {
        return res.status(error.status||500).json({message:'제거 실패'});
    }
})

module.exports = router;