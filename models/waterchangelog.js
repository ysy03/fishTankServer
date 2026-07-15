const { Model } = require("sequelize");


module.exports = (sequelize,DataTypes)=>{
    class Waterchangelog extends Model{

    }
    
    Waterchangelog.init({
        waterchangelog_id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        device_id:{
            
        }
    })
}
