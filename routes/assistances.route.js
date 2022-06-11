const req = require('express');
const jwt= require('jsonwebtoken');
const router = req.Router();

const AssistenceDAO= require('../DAO/assistences_DAO.js');
const assistanceDAO= new AssistenceDAO();

router.get('/:user_id/:event_id', async(req, res) => {
    if ( assistanceDAO.isValidToken(req)) {
        if(!isNaN(req.params.user_id) && !isNaN(req.params.event_id)){
            try{
                const assistances= await assistanceDAO.getAssistancesByEventAndOwnerID(req.params.user_id, req.params.event_id);
                return res.status(200).json(assistances);
            }catch(error){
               return res.status(500).send(error);
            }
        }
    }res.status(401).send("Unauthorized");
})
router.put('/:user_id/:event_id',async(req, res)=>{
    if ( assistanceDAO.isValidToken(req)) {
        if(!isNaN(req.params.user_id) && !isNaN(req.params.event_id)){
            try{
                const assistance= await assistanceDAO.getAssistancesByEventAndOwnerID(req.params.user_id, req.params.event_id);
                if(assistance){
                    if(req.body.user_id) assistance.user_id= req.body.user_id;
                    if(req.body.event_id) assistance.event_id= req.body.event_id;
                    if(req.body.puntuation) assistance.puntuation= req.body.puntuation;
                    if(req.body.comentary) assistance.comentary= req.body.comentary;
                    await assistanceDAO.modifyAssitanceByIdAsAuthenticated(assistance,req.params.user_id, req.params.event_id);
                }
                return res.status(200).json(assistance);
            }catch(error){
                console.log(error);
               return res.status(500).send(error);
            }
        }
    }res.status(401).send("Unauthorized");
})

router.post('/:user_id/:event_id', async(req, res) => {
    if ( assistanceDAO.isValidToken(req)) {
    
    }return res.status(401).send("Unauthorized");
})

module.exports=router;