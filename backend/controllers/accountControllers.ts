import {Request, Response } from "express";
import { AuthRequest } from "../interfaces/AuthRequest.js";
import { Account } from "../models/Account.js";
import zernio from "../config/zernioConfig.js";


// Get All Accounts
// GET api/accounts

export const getAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
    try{
        const user = req.user._id;
        const accounts = await Account.find({ user });
        res.status(200).json(accounts);

    }catch(err : any){
        console.error(err);
        res.status(500).json({ message : err?.message || err });
    }
};


// Add Account
// GET api/accounts

export const addAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
    try{
        const {platform, handle, avatarUrl} = req.body;
        const account = await Account.create({ user : req.user._id, platform, handle, avatarUrl });
        res.status(200).json(account);
    }catch(err : any){
        console.error(err);
        res.status(500).json({ message : err?.message || err });
    }
};




// Disconnect Account
// GET api/accounts/:id

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try{
        const _id = req.params.id;
        const user = req.user._id;
        const account = await Account.findOne({_id, user});
        if(!account){
            res.status(404).json({ message : "Account not found"});
            return;
        }

        if(account.zernioAccountId){
            try{
                await zernio.accounts.deleteAccount({path : {accountId : account.zernioAccountId}});
            }catch(err:any){
                console.error(err);
                res.status(500).json({ message : err?.message || err });
                return;
            }
        }

        await account.deleteOne();
        res.status(200).json({ message : "Account deleted" , account });
    }catch(err : any){
        console.error(err);
        res.status(500).json({ message : err?.message || err });
    }
};