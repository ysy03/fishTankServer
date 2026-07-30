const { Model } = require("sequelize");


module.exports = (sequelize,DataTypes) =>{
    class ChatbotMessage extends Model{
        static associate(db){
            db.ChatbotMessage.belongsTo(db.ChatbotRoom,{foreignKey:'chatbotroom_id',targetKey:'chatbotroom_id'});
        }
    }

    ChatbotMessage.init({
        chatbotmessage_id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        chatbotroom_id:{
            type:DataTypes.INTEGER,
            references:{
                model:'chatbotroom',
                key:'chatbotroom_id'
            },
            onDelete:"CASCADE"
        },
        message:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        role:{
            type:DataTypes.ENUM('model','user'),
            allowNull:false
        }
    },{
        sequelize,
        modelName:'ChatbotMessage',
        tableName:'chatbotmessage',
        createdAt:'created_at',
        updatedAt:false
    })

    return ChatbotMessage
}