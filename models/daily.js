const {Model} = require('sequelize');


module.exports = (sequelize,DataTypes) =>{
    class Daily extends Model{
        static associate(db){
            db.Daily.belongsTo(db.User,{foreignKey:'user_id',targetkey:'user_id'})
        }
    }
    Daily.init({
        daily_id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        user_id:{
            type:DataTypes.INTEGER
        },
        min_temperature:{
            type:DataTypes.FLOAT
        },
        max_temperature:{
            type:DataTypes.FLOAT
        },
        avg_temperature:{
            type:DataTypes.FLOAT
        },
        water_quality:{
            type:DataTypes.INTEGER
        },
        daily:{
            type:DataTypes.DATE,
            defaultValue:DataTypes.NOW
        }
    },{
        sequelize,
        modelName:'Daily',
        tableName:'daily',
        timestamps:false
    })
    return Daily
}