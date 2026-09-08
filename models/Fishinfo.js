const{Model} = require('sequelize');



module.exports = (sequelize,DataTypes)=>{
    class Fishinfo extends Model{
        static associate(db){
            db.Fishinfo.belongsTo(db.Tank,{foreignKey:'device_id',targetKey:'device_id'})
        }
    }

    Fishinfo.init(
        {
            fish_id:{
                type:DataTypes.INTEGER,
                primaryKey:true,
                autoIncrement:true
            },
            fish_type:{
                type:DataTypes.STRING,
                allowNull:false
            },
            fish_count:{
                type:DataTypes.INTEGER,
                allowNull:false
            },
            device_id:{
                type:DataTypes.STRING,

            }
        },{
            sequelize,
            modelName:'Fishinfo',
            tableName:'fishinfo',
            timestamps:false,

        }
    )

    return Fishinfo;
}