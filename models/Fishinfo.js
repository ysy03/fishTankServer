const{Model} = require('sequelize');



module.exports = (sequelize,DataTypes)=>{
    class Fishinfo extends Model{
        static associate(db){
            db.Fishinfo.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'})
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
            user_id:{
                type:DataTypes.INTEGER,

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