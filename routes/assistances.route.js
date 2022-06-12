const req = require('express');
const jwt = require('jsonwebtoken');
const router = req.Router();
const serverStatus = require('../server_status');

const AssistenceDAO = require('../DAO/assistences_DAO.js');
const assistanceDAO = new AssistenceDAO();

/**
 * @api {post} /assistances/ Create an assistance
 */
router.get('/:user_id/:event_id', async (req, res) => {
    if (assistanceDAO.isValidToken(req)) {
        if (!isNaN(req.params.user_id) && !isNaN(req.params.event_id)) {
            try {
                const assistances = await assistanceDAO.getAssistancesByEventAndOwnerID( req.params.event_id ,req.params.user_id);
                if (assistances){
                    return res.status(serverStatus.OK).json(assistances);
                }
                return res.status(serverStatus.NOT_FOUND).send("Assistance not found");
                
            } catch (error) {
                return res.status(serverStatus.INTERNAL_SERVER_ERROR).send(error);
            }
        }
    } res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})
/**
 * You can only update if user_id is the same as authenticated user
 * @api {put} /assistances/:user_id/:event_id Update an assistance
 */
router.put('/:user_id/:event_id', async (req, res) => {
    if (assistanceDAO.isValidToken(req)) {
        if (!isNaN(req.params.user_id) && !isNaN(req.params.event_id)) {
            try {
                const authID = assistanceDAO.getIdFromDecodedToken(req);
                if (authID == req.params.user_id) {
                    const assistance = await assistanceDAO.getAssistancesByEventAndOwnerID(req.params.event_id , req.params.user_id);
                    if (assistance) {
                        if (req.body.user_id) assistance.user_id = req.body.user_id;
                        if (req.body.event_id) assistance.event_id = req.body.event_id;
                        if (req.body.puntuation) assistance.puntuation = req.body.puntuation;
                        if (req.body.comentary) assistance.comentary = req.body.comentary;
                        await assistanceDAO.modifyAssitanceByIdAsAuthenticated(assistance, req.params.user_id, req.params.event_id);
                        return res.status(serverStatus.CREATED).json(assistance);
                    }
                    return res.status(serverStatus.ACCEPTED).json({ message: "Assistance not found" });
                }else return res.status(serverStatus.UNAUTHORIZED).json({ message: "Unauthorized: You can not modify other users assistances" });

               
            } catch (error) {
                return res.status(serverStatus.INTERNAL_SERVER_ERROR).send(error);
            }
        }
    } res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

/**
 * You can only post if user_id is the same as authenticated user
 * @api {post} /assistances/:user_id/:event_id Create an assistance
 */
router.post('/:user_id/:event_id', async (req, res) => {
    if (assistanceDAO.isValidToken(req)) {
        if (!isNaN(req.params.user_id) && !isNaN(req.params.event_id)) {
            try {
                const authID = assistanceDAO.getIdFromDecodedToken(req);
                if (authID == req.params.user_id) {
                    const assistance = await assistanceDAO.getAssistancesByEventAndOwnerID(req.params.event_id, req.params.user_id);
                    if (!assistance) {
                        await assistanceDAO.createAssistance(req);
                        return res.status(serverStatus.CREATED).json({ message: "Assistance created" });

                    } else return res.status(serverStatus.ACCEPTED).json({ message: "Assistance already exists" });

                } else return res.status(serverStatus.UNAUTHORIZED).json({ message: "Unauthorized: You can not modify other users assistances" });


            } catch (error) {
                return res.status(serverStatus.INTERNAL_SERVER_ERROR).send(error);
            }
        }
    } return res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})
/**
 * You can only delete if user_id is the same as authenticated user
 * @api {delete} /assistances/:user_id/:event_id Delete an assistance
 * 
 */
router.delete('/:user_id/:event_id', async (req, res) => {
    if (assistanceDAO.isValidToken(req)) {
        if (!isNaN(req.params.user_id) && !isNaN(req.params.event_id)) {
            try {
                const authID = assistanceDAO.getIdFromDecodedToken(req);
              
                if (authID == req.params.user_id) {
                    const assistance = await assistanceDAO.getAssistancesByEventAndOwnerID(req.params.event_id, req.params.user_id);

                    if (assistance) {
                        await assistanceDAO.deleteAssistanceFromEvent(req.params.user_id, req.params.event_id);
                        return res.status(serverStatus.OK).json({ message: "Assistance deleted" });
                    }
                    return res.status(serverStatus.ACCEPTED).json({ message: "Assistance not found" });
                } else return res.status(serverStatus.UNAUTHORIZED).json({ message: "Unauthorized: You can not delete other users assistances" });

            } catch (error) {
                return res.status(serverStatus.INTERNAL_SERVER_ERROR).send(error);
            }
        }
    } return res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

module.exports = router;