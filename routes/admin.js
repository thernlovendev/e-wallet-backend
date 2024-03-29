require('dotenv').config();
const express = require('express');
const { compareFaces, compareDNI } = require('../apiAmazon');
const { 
    validuser, 
    newUser, 
    getDataUser, 
    setVerifiedTrue, 
    stripeIDs, 
    activateWallet, 
    getUsers, 
    getChangesCurrencys, 
    confirmCell, 
    getSMSCode, 
    getTransaction, 
    updateBalance, 
    updateUserBalance2, 
    generateID, 
    searchDestination, 
    editAddress,
    editUserData,
    resetPassword,
    updateActivate,
    updateBlock,
    getTotalMoney,
    deleteUser, 
    getTransactions,
    setReportsUserData,
    getTransactionAdmin,
    getCardRequests,
    setStripeCard,
    closeCardRequest} = require('../apiFirebase');
   
const { 
    createAccount, 
    createCustomer, 
    withdraw2, 
    addMoney, 
    getBalance,
    createCardHolder,
    createCreditCard,
    refoundCharge} = require('../apiStripe');
const { verifyAddress } = require('../apiAddress');
const { createCode } = require('../apiTwilio');
const { SingInPass, CreateEmailUser } = require('../apiAuth');
const router = express.Router();

router.post("/rejectCardRequest", async (req, res) => {
    const id = req.body.id;
    const localDate = new Date();
    const localDay = await localDate.getDate();
    const localMonth = await localDate.getMonth() + 1; 
    const localYear = await localDate.getFullYear();
    const date = localDay + "/" + localMonth + "/" + localYear
    getDataUser(id).then(user => {
        const card = {
            id :  "rejected", last4: "", exp_month: "", exp_year: ""
        }
        setStripeCard(card, id).then(user => {
            closeCardRequest(user, "rejected", card.id, "Ok", date).then(requestClosed => {
                getDataUser(id).then(user => {
                    res.status(200).send(user)
                }).catch(error => {console.log(error), res.status(404).send({error: "Not"})})
            }).catch(error => {console.log(error), res.status(404).send({error: "Not"})})
        }).catch(error => {console.log(error), res.status(404).send({error: "Not"})})
    }).catch(error => {console.log(error), res.status(404).send({error: "Not"})})
})

router.post('/createUser', async (req, res) => {
    const user = req.body;
    const email = req.body.email;
    const password = req.body.password;
    console.log(user)
    CreateEmailUser(email, password).then(User => {
      newUser(User.uid, user.name, email, user.lastName, user.country, user.currency, user.phone,
         password, user.day, user.month, user.year, user.role, user.activate, user.blocked).then(user =>{
        res.status(200).send(user)
      }).catch(error => {
        res.status(400).send(error)
      })
    }).catch(error => {
      if(error.code === "auth/email-already-in-use"){
        res.status(400).send(error)
      }else{
        res.status(401).send(error)
      }
    })
});

router.post("/getCardRequests", async (req, res) => {
    getCardRequests().then(data => {
        res.status(200).send(data)
    }).catch(error => {res.status(401).send(error)})
})

router.post("/getDashData", async (req, res) => {
    getUsers().then(usersData => {
        getBalance().then(balance => {
            const data = {
                usersData,
                balance : balance
            }
            console.log(data, balance)
            res.status(200).send(data)
        })
    }).catch(error => {
        console.log(error)
        res.status(400).send(error)
    })
})

router.post("/confirmCreditCard", async (req, res) => {
    const id = req.body.id;
    const localDate = new Date();
    const localDay = await localDate.getDate();
    const localMonth = await localDate.getMonth() + 1; 
    const localYear = await localDate.getFullYear();
    const date = localDay + "/" + localMonth + "/" + localYear
    getDataUser(id).then(user => {
        createCardHolder(user).then(holder => {
            createCreditCard(holder.id, user).then(card => {
                setStripeCard(card, id).then(user => {
                    closeCardRequest(user, "aproved", card.id, "Ok", date).then(requestClosed => {
                        res.status(200).send(user)
                    }).catch(error => {console.log(error), res.status(403).send({error: "Not"})})
                }).catch(error => {console.log(error), res.status(403).send({error: "Not"})})
            }).catch(error => {console.log(error), res.status(403).send({error: "Not"})})
        }).catch(error => {console.log(error, "tesssst"),res.status(400).send({error: "Not"})})
    }).catch(error => {console.log(error), res.status(404).send({error: "Not"})})
})

router.post("/getTransaction", async (req, res) => {
    const id = req.body.id
    getTransactionAdmin(id).then(transaction => {
        res.status(200).send(transaction)
    }).catch(error => {
        console.log(error)
        res.status(400).send(error)
    })
})

router.post("/getDataUser", async (req, res) => {
    const id = req.body.id;
    getDataUser(id).then(user => {
        res.status(200).send(user)
    }).catch(error => {
        console.log(error)
        res.status(400).send(error)
    })
})

router.post("/getReportsData", async (req, res) => {
    getUsers().then(users => {
        
    }).catch(error => {
        console.log(error)
        res.status(400).send(error)
    })
})
  
router.post('/getUsers', async (req, res) => {
    getUsers().then(data => {
        res.status(200).send(data);
        console.log("Ok!");
    }).catch(error => {
        res.status(400).send(error)
    });
});

router.post("/getTransactions", async (req, res) => {
    console.log("test")
    //const id = req.body.id;
    getTransactions().then(transactions => {
        res.status(200).send(transactions);
    }).catch(error => {
        res.status(400).send(error)
    });
})
  
router.post('/getUserData', async (req, res) => {
    const id = req.body.id;
    getDataUser(id).then(user => {
        res.status(200).send(user)
        console.log("Ok!");
    }).catch(error => {
        console.log(error)
        res.status(400).send({error: "No user found"})
    })
});
  
router.post('/editUserAddress', async (req, res) => {
      const id = req.body.id;
      const address = req.body;
      console.log(id);
      console.log(address);
      editAddress(id, address).then(data => {
              res.status(200).send(data)
              console.log("Ok!");
      }).catch(error => {
          console.log(error)
          res.status(400).send(error)
      })
});
  
router.post('/editUserData', async (req, res) => {
    const id = req.body.id;
    const user = req.body;
    console.log(id);
    console.log(user);
    editUserData(id, user).then(data => {
            res.status(200).send(data)
            console.log("Ok!");
    }).catch(error => {
        console.log(error)
        res.status(400).send(error)
    })
});
  
router.post('/deleteUser', async (req, res) => {
    const id = req.body.id;
    console.log(id);
    deleteUser(id).then(data => {
            res.status(200).send(data)
    }).catch(error => {
        console.log(error)
        res.status(400).send({error: "No user found"})
    })
});

router.post("resetPass", async (req, res) => {
    const id = req.body.id;
    resetPass(id).then( data => {
        getDataUser(id).then(user => {
            res.status(200).send(user)
        })
    })
})

router.post("/refoundCharge", async (req, res) => {

})
  
/*
router.post('/resetPassword', async (req, res) => {
    const id = req.body.id;
    const password = req.body.password;
    if (!password) {res.status(400).send({error: "No Passowrd found"});return false;}
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hashSync(password, salt);
    console.log(id);
    console.log(hash);
    resetPassword(id, hash).then(data => {
            res.status(200).send(data)
            console.log("Ok!");
    }).catch(error => {
        console.log(error)
        res.status(400).send(error)
    })
});*/
  
router.post('/updateActivate', async (req, res) => {
    const id = req.body.id;
    const isActivate = req.body.isActivate;
    console.log(id);
    updateActivate(id, isActivate).then(data => {
      res.status(200).send(data)
      console.log("Ok!");
      }).catch(error => {
         console.log(error)
         res.status(400).send(error)
    })
});
  
router.post('/updateBlock', async (req, res) => {  
    const id = req.body.id;
    getDataUser(id).then(user => {
        updateBlock(id, user.isBlocked).then(data => {
            res.status(200).send(data)
            console.log("Ok!");
        }).catch(error => {
            console.log(error)
            res.status(400).send(error)
        })
    })
});
  
router.post('/getTransaction', async (req, res) => {
    const id = req.body.tid;
    getTransactionAdmin(id).then(data => {
      res.status(200).send(data);
      console.log("Ok!");
    }).catch(error => {
      res.status(400).send(error)
    })
});
  
router.post('/getTotalMoney', async (req, res) => {
    getTotalMoney().then(data => {
      res.status(200).send(data);
      console.log("Ok!");
    }).catch(error => {
      res.status(400).send(error)
    });
});

router.post("/refoundTransaction", async (req, res) => {
    console.log(req.body.transaction)
    const transaction = req.body.transaction;
    const localDate = new Date();
    const localDay = await localDate.getDate();
    const localMonth = await localDate.getMonth() + 1; 
    const localYear = await localDate.getFullYear();
    const date = localDay + "/" + localMonth + "/" + localYear
    const DATE = {day: localDay, month: localMonth, year: localYear}
    const transactionID = await generateID();
    getDataUser(transaction.userID).then(user => {
        const email = user.email;
        if(transaction.action === "charge" || transaction.action === "Top-up"){
            refoundCharge(transaction).then(re => {
                updateUserBalance2(transaction.userID, -transaction.amount, transaction.currency, re.id, "refound", "", re.status, date, DATE
                ).then(user => {
                    res.status(200).send(user)
                }).catch(error => {console.log(error), res.status(404).send({error: "Not"})})
            }).catch(error => {
                if(error.raw.code === "charge_already_refunded"){
                    console.log("test")
                    res.status(406).send({error: "already refunded"})
                }else{
                    console.log(error), res.status(404).send({error: "Not"})
                }
                
            }) 
        }
        if(transaction.action === "transfer"){
            updateUserBalance2(transaction.userID, transaction.amount, transaction.currency, transactionID,
            "refound", transaction.userInteraction, "success", date, DATE).then(data => {
                searchDestination(transaction.userInteraction).then(user => {
                    updateUserBalance2(user.id, -transaction.amount, transaction.currency, transactionID, "refound", 
                    email, "success", date, DATE).then(user => {
                        res.status(200).send(user)
                    }).catch(error => {console.log(error), res.status(404).send({error: "Not"})})
                }).catch(error => {console.log(error), res.status(404).send({error: "Not"})})
            }).catch(error => {console.log(error), res.status(404).send({error: "Not"})})
        }
    }).catch(error => {console.log(error), res.status(404).send({error: "Not"})})
})

  
  
module.exports = router;