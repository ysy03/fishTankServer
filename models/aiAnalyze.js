const { Model } = require("sequelize");


module.exports = (sequelize,DataTypes)=>{
    class AiAnalyze extends Model{

    }

    AiAnalyze.init({
        analysis_id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true,
            allowNull:false
        },
        device_id:{
            type:DataTypes.STRING,
            references:{
                model:'tank',
                key:'device_id'
            },
            onDelete:'CASCADE'
        },
        user_id:{
            type:DataTypes.INTEGER,
            references:{
                model:'user',
                key:'user_id'
            },
            onDelete:'CASCADE'
        },
        activity:{
            type:DataTypes.INTEGER,
            allowNull:true
        },
        detections:{
            type:DataTypes.JSON,
            allowNull:false
        },
        analyzed_at:{
            type:DataTypes.DATE,
            defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
        }
    },{
        sequelize,
        timestamps:false,
        modelName:'AiAnalyze',
        tableName:'ai_analyze'
    })

    return AiAnalyze
}