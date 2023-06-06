const {MongoClient, ObjectId} = require("mongodb")
async function connect(){
    if(global.db) return global.db;
    const conn = await MongoClient.connect("mongodb+srv://assinaqui:assinaqui123@cluster0.mrqwhwr.mongodb.net/test");
    if(!conn) return new Error("ERRO ao conectar");
    global.db = await conn.db("Cadastro");
    return global.db;
    //divisão 
}


const express = require("express");
const app = express();
const port = 3000;

app.use(require('cors')());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const router = express.Router();



//configurando rota teste get
router.get('/', (req, res) => res.json({message: 'Funcionando!'}));


//get
router.get('/pessoa/:id?', async function(req, res, next) {
    try{
        
        const db = await connect();
        
        if (req.params.id) {
            res.json(await db.collection("pessoa").findOne({_id: new ObjectId(req.params.id)}));
        } else {
            res.json(await db.collection("pessoa").find().toArray());
        }
    }
    catch(ex){
        console.log(ex)
        res.status(400).json({erro: `${ex}`})
    }
})



//post

router.post('/pessoa', async function(req, res, next){
    try {
        const pessoa = req.body
        const db = await connect()
        res.json(await db.collection("pessoa").insertOne(pessoa))
    } catch (error) {
        console.log(ex)
        res.status(400).json({erro: `${ex}`})
    }
} )

//put
router.put('/pessoa/:id', async function(req, res, next){
    try {
        const pessoa = req.body;
        const db = await connect();
        res.json(await db.collection("pessoa").updateOne({_id: new ObjectId(req.params.id)}, {$set: pessoa}));
    } catch (ex) {
        console.log(ex);
        res.status(400).json({erro: `${ex}`});        
    }
})
//delete

router.delete('/pessoa/:id', async function(req, res, next){
    try {
        const db = await connect();
        res.json(await db.collection("pessoa").deleteOne({_id: new ObjectId(req.params.id)}))
        
    } catch (ex) {
        console.log(ex)
        res.status(400).json({erro: `${ex}`})
        
    }
}
)
//Rota login

router.post('/login', async function(req, res, next){
    try {
        const db = await connect();
        const {email, senha} = req.body;
        const usuario = await db.collection("pessoa").findOne({email: email, senha: senha});
        return res.json(usuario);
        if (!usuario) {
            
            return res.status(401).json({ erro: 'Credenciais inválidas' });
          }
      
          if (usuario.senha !== senha) {
            
            return res.status(401).json({ erro: 'Credenciais inválidas' });
          } 
          const token = jwt.sign({id: usuario._id, email: usuario.email }, 'chave_secreta', { expiresIn: '1h' });
          return res.json({ token: token });
    } catch (error) {
        console.log(ex)
        res.status(400).json({erro: `${ex}`})
    }
})


//configuração dos servidores
app.use('/', router);
app.listen(port)

console.log('API funcionando!');