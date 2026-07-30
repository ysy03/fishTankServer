const { Model } = require("sequelize");


module.exports = (sequelize,DataTypes) =>{
    class ChatbotRoom extends Model{
        static associate(db){
            db.ChatbotRoom.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'});
            db.ChatbotMessage.hasMany(db.ChatbotMessage,{foreignKey:'chatbotroom_id',sourceKey:'chatbotroom_id'})
        }
    }
    
    ChatbotRoom.init({
        chatbotroom_id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
            autoIncrement:true
        },
        user_id:{
            type:DataTypes.INTEGER,
            references:{
                model:'user',
                key:'user_id'
            },
            unique:true,
            onDelete:'CASCADE'
        },
        
    },{
            sequelize,
            modelName:'ChatbotRoom',
            tableName:'chatbotroom',
            timestamps:true
    })

    return ChatbotRoom
}