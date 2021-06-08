
const sqlite3 = require('sqlite3');

const entoBng = (bn)=>{
    if(bn === null) return null;
    let cengn = '';
    const b2e = {
        '1':'১',
        '2':'২',
        '3':'৩',
        '4':'৪',
        '5':'৫',
        '6':'৬',
        '7':'৭',
        '8':'৮',
        '9':'৯',
        '0':'০',
    };
    for(let i = 0; i < bn.length; i++){
        cengn += b2e[bn[i]];
    }
    return cengn;
}

const db = new sqlite3.Database('db.sqlite3', (err)=>{
    if(err){
        return console.error(err.message);
    }
    let sql1 = `
        CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description text,
        quantity INTEGER,
        ammount INTEGER,
        due INTEGER,
        type text,
        instid INTEGER,
        comment text,
        date timestamp default CURRENT_DATE);
    `;
    db.run(sql1);
    sql1 = `
            CREATE TABLE IF NOT EXISTS institute (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name text,
            details text,
            contacts text);
    `;
    db.run(sql1);
    console.log("connected to the database");
});

const dothis = async (id)=>{
    const modal1 = document.querySelector('#modal1');
    modal1.innerHTML = "";
    modal1.innerHTML = await editOperation(id);
    M.FormSelect.init(document.querySelector('#edittypeSelect'));
    document.querySelector('#brow2').innerHTML = await getIntituteName();
    const selem = document.querySelector('#edittypeSelect')
    let datas = { };
    document.querySelector('#updateaccount').addEventListener('click', ()=>{
        datas.type = selem.options[selem.selectedIndex].value;
        let inputs = ["editcomment", "editdue", "editammount", 'editquantity', 'editdescription', 'editinstid', 'editdate'];
            inputs.forEach(ids =>{
                let inp = document.querySelector(`#${ids}`);
                if(inp.value === "" || inp.value === undefined || inp.value === null){
                    datas[inp.id] = null;     
                }else{
                    datas[inp.id] = inp.value;     
                }
            });
            datas.editdate = BdateToEng(datas.editdate);
            datas.editdue =  isBengaliNumber(datas.editdue)? bntoEng(datas.editdue): parseInt(datas.editdue);
            datas.editammount =  isBengaliNumber(datas.editammount)? bntoEng(datas.editammount): parseInt(datas.editammount);
            datas.editquantity =  isBengaliNumber(datas.editquantity)? bntoEng(datas.editquantity): parseInt(datas.editquantity);
            datas.editdue =  isNaN(datas.editdue)? null:datas.editdue ;
            datas.editammount =  isNaN(datas.editammount)? null:datas.editammount ;
            datas.editquantity =  isNaN(datas.editquantity)? null:datas.editquantity ;
            datas.editinstid =  isNaN(parseinstId(datas.editinstid))? null:parseinstId(datas.editinstid);
            // console.log(datas);
            updateAccount(datas, id);
        
    });
    document.querySelector('#deleteaccount').addEventListener('click', ()=>{
        deleteAccount(id);
    });

};

const instOp = async (id)=>{
    const modal1 = document.querySelector('#modal1');
    modal1.innerHTML = "";
    modal1.innerHTML = await instOperation(id);
    let datas = {};
    document.querySelector('#updateInst').addEventListener('click', ()=>{
        let inputs = ["editname", "editdetails", "editcontacts"];
            inputs.forEach(ids =>{
                let inp = document.querySelector(`#${ids}`);
                if(inp.value === "" || inp.value === undefined || inp.value === null){
                    datas[inp.id] = null;     
                }else{
                    datas[inp.id] = inp.value;     
                }
            });
            updateInstitute(datas, id);
        
    });
    document.querySelector('#deleteInst').addEventListener('click', ()=>{
        deleteInstitute(id);
    });

};

const instOperation = async (id)=>{
    let instName = await getIntituteNameById(id);
    const cdinp = `
        <div id="MEditform">
            <div class="input-field col s12">
                <input id="editname" value="${instName.name}" type="text" class="validate"/>
                <label for="editname">Name</label>
            </div>
            <div class="input-field col s12">
                <input value="${instName.details}" id="editdetails" type="text" class="validate"/>
                <label for="editdetails">Details</label>
            </div>
            <div class="input-field col s12">
                <input value="${instName.contacts}" id="editcontacts" type="text" class="validate"/>
                <label for="editcontacts">Contacts</label>
            </div>
        </div>
    `;
    const addForm = `
        <div class="modal-content green lighten-4">
        <div class="card-panel addpanel green lighten-5" style="max-height:360px; overflow:scroll;">
            <div class="row">
                ${cdinp}
            </div>
            
        </div>
        <div class="row">
        <button id="updateInst" class="col s2 btn btn-medium modal-close">Update</button>
        <div class="col s8"></div>
        <button id="deleteInst" class="col s2 btn btn-medium modal-close red lighten-1">Delete</button>
        </div>
    
    `;

    return addForm;
};


const dbOp = ()=>{
    return `
        <select class="" name="dbOp" id="dbOp" value="OP" style="width: 64px; font-size:12px;">
            <option value="" disabled selected>OP</disabled>
            <option value="update">update</option>
            <option value="delete">delete</option>
        </select>
    `;
}

const getRow = async (types, search=null)=>{
    const instObj = await getIntituteNameId();
    let thead = `
        <thead>
          <tr>
              <th>ক্রমিক নং</th>
              <th>জমা বিবরণী</th>
              <th>পরিমাণ</th>
              <th>পাওনা</th>
              <th>ধরন</th>
              <th>প্রতিষ্ঠানের নাম</th>
              <th>মূল্য</th>
              <th>তারিখ</th>
              <th></th>
          </tr>
        </thead> 
    `;
    let str = "";
    let sql = "select * from accounts";
    if(types === 'credit'){
        
        sql = `select * from accounts where type='credit'`;
        if(search === null){
            sql = `select * from accounts where type='credit'`;
        }
        else if(isDateFormat(search)){
            sql = `select * from accounts where type='credit' and date='${search}'`;
        //     // sql = `select * from institute inner join accounts on institute.id=accounts.instid where accounts.type="credit" and accounts.date like '%${search}%'`;
        }
        else{
        //     sql = "select * from accounts where type='credit'";
            sql = `select accounts.instid, institute.name, accounts.id, accounts.description, accounts.quantity, accounts.ammount, accounts.due, accounts.type, accounts.date from institute inner join accounts on institute.id=accounts.instid where type="credit" and institute.name like "%${search}%"`;
        }
    }else if(types === 'debit'){
        sql = `select * from accounts where type='debit'`;
        if(search === null){
            sql = `select * from accounts where type='debit'`;
        }
        else if(isDateFormat(search)){
            sql = `select * from accounts where type='debit' and date='${search}'`;
        }else{
            sql = `select accounts.instid, institute.name, accounts.id, accounts.description, accounts.quantity, accounts.ammount, accounts.due, accounts.type, accounts.date from institute inner join accounts on institute.id=accounts.instid where type="debit" and institute.name like "%${search}%"`;
        }
    }else if(types === 'institute'){
        sql = 'select * from institute';
        thead = `
        <thead>
          <tr>
              <th>ক্রমিক নং</th>
              <th>প্রতিষ্ঠানের নাম</th>
              <th>বিবরণী</th>
              <th>যোগাযোগ</th>
              <th></th>
          </tr>
        </thead> 
    `;
    }
    else if(types === 'all'){
        sql = 'select * from accounts';
        // sql=`select * from institute inner join accounts on institute.id=accounts.instid`;
    }else{
        // sql = 'select * from accounts';
        // sql=`select * from institute inner join accounts on institute.id=accounts.instid`;
    }
    return new Promise((resolve, reject)=>{
    db.all(sql,[], async (err, row)=>{
            if(row){
                const instname = await getIntituteNameId();
                row.forEach(async (a, index)=>{
                    const inst = instname.find(n=> n.id === a.instid);
                    if(types === 'institute'){
                        str+=`<tr>
                        <td>${ entoBng((index+1).toString())}</td>
                        <td class="tds">${a.name}</td>
                        <td>${a.details}</td>
                        <td>${a.contacts}</td>
                        <td style="table-layout:fixed;width:20px;overflow:hidden;"><button href="#modal1" onclick="instOp(${a.id})" class="btn btn-small waves-effect waves-light cyan modal-trigger">c</button></td>
                        </tr>`;
                    }
                    else{
                    str+=`<tr>
                        <td>${entoBng((index+1).toString())}</td>
                        <td class="tds">${a.description}</td>
                        <td>${entoBng(a.quantity === null ? null: a.quantity.toString())}</td>
                        <td>${entoBng(a.due === null? null: a.due.toString())}</td>
                        <td>${a.type === 'credit' ? "খরচ":"জমা"}</td>
                        <td class="tds">${inst === undefined ? null: inst.name}</td>
                        <td>${entoBng(a.ammount === null ? null: a.ammount.toString())}</td>
                        <td>${a.date}</td>
                        <td style="table-layout:fixed;width:20px;overflow:hidden;"><button href="#modal1" onclick="dothis(${a.id})" class="btn btn-small waves-effect waves-light cyan modal-trigger">c</button></td>
                        </tr>`;
                    }
                });
            }else{
                console.log("row is empty");
            }
            
            const table = `
            <table class="highlight">
                ${thead}
                <tbody>
                    ${str} 
                </tbody>
            </table>
            `;
            resolve(table);
        });
    });
};

const handledRange1 = ()=>{
    const drange1 = document.querySelector('#drange1');
    drange1.addEventListener('change', ()=>{
        let drval = drange1.options[drange1.selectedIndex].value;
        switch(drval){
            case 'today':
                renderMonthSelect(1);
                break;
            case 'week':
                splaceholder = document.querySelector('#splaceholder').innerHTML = "";
                break;
            case 'month':
                renderMonthSelect(2);
                break;
            default:
                console.log("Invalid select");
        }
    });
};

const renderMonthSelect = (stat)=>{
    const date = new Date()
    console.log(date);
    let months;
    if(stat === 2){
         months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Octover', 'November', 'December'];
    }else if(stat === 1){
         months = getDays();
    }
    const splaceholder = document.querySelector('#splaceholder');
    let sm = '';
    months.forEach((m, index)=>{
        sm += `<option value="${index}">${m}</option>`;
    });
    splaceholder.innerHTML = `<select id="selectmonth">${sm}</select>`;
    const sms = document.querySelector('#selectmonth');
    if(stat === 2){
        sms.selectedIndex = date.getMonth();
    }else if(stat === 1){
        sms.selectedIndex = date.getDate() - 1;
    }
    M.FormSelect.init(sms);
};

const getDays = ()=>{
    const arr = [];
    for(let i = 1; i <= 31; i++){
        arr.push(i);
    };
    return arr;
    
};

const addOperation = async ()=>{
    const modal1 = document.querySelector('#modal1');
    const cdinp = `
        <div id="addFSec">
            <div class="input-field col s12">
                <input id="addinstid" list="brow" placeholder="প্রতিষ্ঠানের নাম" class="input-field col s12">
                <datalist id="brow">
                    <option value="Internet Explorer">
                    <option value="Firefox">
                    <option value="Chrome">
                    <option value="Opera">
                    <option value="Safari">
                </datalist>
            </div>
            <div class="input-field col s12">
                <input id="adddescription" type="text"/>
                <label for="adddescription">বিবরণী</label>
            </div>
            <div class="input-field col s12">
                <input id="addquantity" type="text" class="validate"/>
                <label for="addquantity">পরিমাণ</label>
            </div>
            <div class="input-field col s12">
                <input id="addammount" type="text" class="validate"/>
                <label for="addammount">টাকা</label>
            </div>
            <div class="input-field col s12">
                <input id="adddue" type="text" class="validate"/>
                <label for="adddue">পাওনা</label>
            </div>
            <div class="input-field col s12">
                <input id="addcomment" type="text" class="validate"/>
                <label for="addcomment">মন্তব্য</label>
            </div>
        </div>
    `;
    const instinp = `
         <div class="input-field col s12">
                <input id="instname" type="text" class="validate"/>
                <label for="instname">প্রতিষ্ঠানের নাম</label>
            </div>
            <div class="input-field col s12">
                <input id="instdetail" type="text" class="validate"/>
                <label for="instdetail">বিস্তারিত</label>
            </div>
            <div class="input-field col s12">
                <input id="instcontacts" type="text" class="validate"/>
                <label for="instcontacts">যোগাযোগ</label>
            </div>
    `;
    const addForm = `
        <div class="modal-content green lighten-4">
        <div class="card-panel addpanel green lighten-5" style="max-height:360px; overflow:scroll;">
            <div class="row">
                <div calss="col s12" style="padding: 0 10px;">
                    <select id="sInsSM">
                            <option value="debit">জমা</option>
                            <option value="credit">খরচ</option>
                            <option value="institute">প্রতিষ্ঠান</option>
                    </select>
                </div>
                ${cdinp}
            </div>
            
        </div>
        <button id="addsave" class="btn btn-medium modal-close">Save</button>
    
    `;
    modal1.innerHTML = addForm;
    document.querySelector('#brow').innerHTML = await getIntituteName();
    let elem = document.querySelector('#sInsSM');
    M.FormSelect.init(elem);
    let selectvalue = '';
    elem.addEventListener('change', async()=>{
        let elemval = elem.options[elem.selectedIndex].value;
        selectvalue = elemval;
        if(elemval === 'institute'){
            document.querySelector('#addFSec').innerHTML = instinp;
        }else{
            document.querySelector('#addFSec').innerHTML = cdinp;
            document.querySelector('#brow').innerHTML = await getIntituteName();
        }
    });
    document.querySelector('#addsave').addEventListener('click', ()=>{
        let inputs;
        const datas = {type: selectvalue};
        if(datas.type === 'institute'){
            inputs = ["instname", "instcontacts", "instdetail"];
            inputs.forEach(ids =>{
                let inp = document.querySelector(`#${ids}`);
                if(inp.value === "" || inp.value === undefined || inp.value === null){
                    datas[inp.id] = null;     
                }else{
                    datas[inp.id] = inp.value;     
                }
            });
            insertInstitue(datas);
        }else if(datas.type === '' || datas.type === 'credit' || datas.type === 'debit'){
            inputs = ["addcomment", "adddue", "addammount", 'addquantity', 'adddescription', 'addinstid'];
            if(datas.type === ''){
                datas.type = "debit";
            }
            inputs.forEach(ids =>{
                let inp = document.querySelector(`#${ids}`);
                if(inp.value === "" || inp.value === undefined || inp.value === null){
                    datas[inp.id] = null;     
                }else{
                    datas[inp.id] = inp.value;     
                }
            });
            datas.adddue =  isBengaliNumber(datas.adddue)? bntoEng(datas.adddue): parseInt(datas.adddue);
            datas.addammount =  isBengaliNumber(datas.addammount)? bntoEng(datas.addammount): parseInt(datas.addammount);
            datas.addquantity =  isBengaliNumber(datas.addquantity)? bntoEng(datas.addquantity): parseInt(datas.addquantity);
            datas.adddue =  isNaN(datas.adddue)? null:datas.adddue ;
            datas.addammount =  isNaN(datas.addammount)? null:datas.addammount ;
            datas.addquantity =  isNaN(datas.addquantity)? null:datas.addquantity ;
            datas.addinstid =  isNaN(parseinstId(datas.addinstid))? null:parseinstId(datas.addinstid);
            insertData(datas);
        }
        
    });

};
const editOperation = async (id)=>{
    let acccountinfo = await getAccountInfo(id);
    acccountinfo = acccountinfo[0];
    let instName = {name: null, id: null};
    instName = await getIntituteNameById(acccountinfo.instid);
    if(instName){
    }else{
        instName = {name: "", id: ""};
    }
    const cdinp = `
        <div id="MEditform">
            <div class="input-field col s12">
                <input value="${instName.name} $${instName.id}" id="editinstid" list="brow2" placeholder="প্রতিষ্ঠানের নাম ..." class="input-field col s12">
                <datalist id="brow2">
                    <option value="Internet Explorer">
                    <option value="Firefox">
                    <option value="Chrome">
                    <option value="Opera">
                    <option value="Safari">
                </datalist>
            </div>
            <div class="input-field col s12">
                <input id="editdescription" value="${acccountinfo.description}" type="text" class="validate"/>
                <label for="editdescription">বিবরণী</label>
            </div>
            <div class="input-field col s12">
                <input value="${acccountinfo.quantity}" id="editquantity" type="text" class="validate"/>
                <label for="editquantity">পরিমাণ</label>
            </div>
            <div class="input-field col s12">
                <input value="${acccountinfo.ammount}" id="editammount" type="text" class="validate"/>
                <label for="editammount">টাকা</label>
            </div>
            <div class="input-field col s12">
                <input value="${acccountinfo.due}" id="editdue" type="text" class="validate"/>
                <label for="editdue">পাওনা</label>
            </div>
            <div class="input-field col s12">
                <input value="${acccountinfo.comment}"  id="editcomment" type="text" class="validate"/>
                <label for="editcomment">মন্তব্য</label>
            </div>
            <div class="input-field col s12">
                <input value="${acccountinfo.date}"  id="editdate" type="text" class="validate"/>
                <label for="editdate">তারিখ</label>
            </div>
        </div>
    `;
    const addForm = `
        <div class="modal-content green lighten-4">
        <div class="card-panel addpanel green lighten-5" style="max-height:360px; overflow:scroll;">
            <div class="row">
                <div calss="col s12" style="padding: 0 10px;">
                    <select id="edittypeSelect">
                            <option value="${acccountinfo.type}">${acccountinfo.type === 'credit' ? 'খরচ':'জমা'}</option>
                            <option value="debit">জমা</option>
                            <option value="credit">খরচ</option>
                    </select>
                </div>
                ${cdinp}
            </div>
            
        </div>
        <div class="row">
        <button id="updateaccount" class="col s2 btn btn-medium modal-close">Update</button>
        <div class="col s8"></div>
        <button id="deleteaccount" class="col s2 btn btn-medium modal-close red lighten-1">Delete</button>
        </div>
    
    `;

    return addForm;
};

const insertData = (data)=>{
    let sql = `INSERT INTO accounts(description, quantity, ammount, due, instid, comment, type) 
    values ("${data.adddescription}", ${data.addquantity}, ${data.addammount}, ${data.adddue}, 
    ${data.addinstid}, "${data.addcomment}", "${data.type}") `;
    db.run(sql, async (err)=>{
        if(err){
            console.log(err);
        }
        document.querySelector('#data').innerHTML = await getRow();
        console.log("data added");
    });
}


const insertInstitue = (data)=>{
    let sql = `INSERT INTO institute(name, details, contacts) 
    values ("${data.instname}", "${data.instdetail}", "${data.instcontacts}")`;
    db.run(sql, async (err)=>{
        if(err){
            console.log(err);
        }
        console.log("data added");
    });
};

const getIntituteName = ()=>{
    const sql = 'select id,name from institute';
    return new Promise((resolve, reject)=>{
        let str = "";
        db.all(sql,[], (err, row)=>{
        if(row){
            row.forEach((a, index)=>{
                str+=`<option value="${a.name} $${a.id}">`;
            });
        }else{
            console.log("row is empty");
        }
        resolve(str);
        });
    });
};
const getIntituteNameId = ()=>{
    const sql = 'select id,name from institute';
    return new Promise((resolve, reject)=>{
        
        db.all(sql,[], (err, row)=>{
            if(row){
                resolve(row);
            }
        });
    });
};
const getIntituteNameById = (id)=>{
    const sql = `select * from institute where id=${id}`;
    return new Promise((resolve, reject)=>{
        db.all(sql,[], (err, row)=>{
            if(row){
                resolve(row[0]);
            }else{
                reject(err);
            }
        });
    });
};


const parseinstId = (str)=>{
    if(str === null || str === undefined){
        str = "";
    }
    let s = ""; let d = 0;
    for(let i = 0; i < str.length; i++){
        if(d === 1){
            s+=str[i];
        }
        if(str[i] === '$'){
            d = 1;
        }
    }
    return parseInt(s);
};

const getAccountInfo = (id)=>{
    const sql = `select * from accounts where id=${id}`;
    return new Promise((resolve, reject)=>{
        db.all(sql,[], (err, row)=>{
            if(row){
                resolve(row);
            }else{
                reject(err);
            }
        });
    });
};



const updateAccount = (data, id)=>{
    const sql = `update accounts set 
        description="${data.editdescription}",
        quantity=${data.editquantity},
        ammount=${data.editammount},
        due=${data.editdue},
        instid=${data.editinstid},
        type="${data.type}",
        date="${data.editdate}",
        comment="${data.editcomment}" where id=${id}`;
    db.run(sql, async (err)=>{
        if(err){
            console.log(err);
        }
        document.querySelector('#data').innerHTML = await getRow();
        console.log("data updated");
    });
}

const updateInstitute= (data, id)=>{
    console.log(data);
    const sql = `update institute set 
        name="${data.editname}",
        details="${data.editdetails}",
        contacts="${data.editcontacts}"
        where id=${id}`;
    db.run(sql, async (err)=>{
        if(err){
            console.log(err);
        }
        document.querySelector('#data').innerHTML = await getRow('institute');
        console.log("data updated");
    });
}

const deleteAccount = (id)=>{
    const sql = `delete from accounts where id=${id}`; 
    db.run(sql, async (err)=>{
        if(err){
            console.log(err);
        }
        document.querySelector('#data').innerHTML = await getRow();
        console.log("data updated");
    });
}
const deleteInstitute = (id)=>{
    const sql = `delete from institute where id=${id}`; 
    db.run(sql, async (err)=>{
        if(err){
            console.log(err);
        }
        document.querySelector('#data').innerHTML = await getRow('institute');
        console.log("data updated");
    });
}

const renderByDebit = ()=>{
    const mainSelect1 = document.querySelector('#mainSelect1');
    mainSelect1.addEventListener('change', async ()=>{
        let value = mainSelect1.options[mainSelect1.selectedIndex].value;
        document.querySelector('#data').innerHTML = await getRow(value);
    });
    let searchbtn = document.querySelector('#searchbtn');
    let bodyhtml = "";
    searchbtn.addEventListener('click', async()=>{
        const search = document.querySelector('#search');
        let value = mainSelect1.options[mainSelect1.selectedIndex].value;
        if(value === 'all'){
            const dataM = document.querySelector('#data');
            dataM.innerHTML = await getAll(search.value === ''?null : search.value);
        }else if(value === 'credit'){
            document.querySelector('#data').innerHTML = await getRow('credit', search.value === ''? null: search.value);
        }else if(value === 'debit'){
            document.querySelector('#data').innerHTML = await getRow('debit', search.value === ''? null: search.value);
        }
    });
    const printbtn = document.querySelector('#printbtn');
    printbtn.addEventListener('click', ()=>{
       const data = document.querySelector('#data');
       data.printMe();

    });
};

const getAll = async (date)=>{
    const thead = `
        <thead>
          <tr>
              <th>ক্রমিক নং</th>
              <th>জমা বিবরণী</th>
              <th>পরিমাণ</th>
              <th>ধরন</th>
              <th>মূল্য</th>
              <th>ক্রমিক নং</th>
              <th>খরচ বিবরণী</th>
              <th>পরিমাণ</th>
              <th>ধরন</th>
              <th>মূল্য</th>
          </tr>
        </thead> 
    `;
     let str = "";
     let str2 = "";
     let p1 = 0, p2 = 0; let debitTotal = 0, creditTotal = 0;
    return new Promise((resolve, reject)=>{
        let sql;
        let sdate = document.querySelector('#sdate');
        if(date == null){
            sql = `select * from accounts`;
        }
        else if(isDateFormat(date) && sdate.value === ''){
            date = date.replaceAll('x', '');
            sql = `select * from accounts where date like "%${date}%"`;
        }else if(sdate.value !== ''){
            sdate = sdate.replaceAll('x', '');
            sql = `select institute.name, accounts.id, accounts.description, accounts.quantity, accounts.ammount, accounts.due, accounts.type, accounts.date from institute inner join accounts on institute.id=accounts.instid where accounts.date like "%${sdate.value}%" and institute.name like "%${date}%";`
        }else{
           sql = `select institute.name, accounts.id, accounts.description, accounts.quantity, accounts.ammount, accounts.due, accounts.type, accounts.date from institute inner join accounts on institute.id=accounts.instid where institute.name like "%${date}%";`
        }
        
        db.all(sql,[], (err, row)=>{
            if(row){
                const credits = row.filter(e=>e.type ==='credit');
                const debits = row.filter(e=>e.type ==='debit');
                for(let i = 0; i < Math.max(credits.length, debits.length); i++){
                    // style="text-align: center;"
                    creditTotal += credits[i] === undefined ? 0: credits[i].ammount === null ? 0 : credits[i].ammount;
                    debitTotal += debits[i] === undefined ? 0: debits[i].ammount === null ? 0 : debits[i].ammount;
                    str+=`<tr>
                        <td>${i+1}</td>
                        <td style="word-wrap: break-word; max-width: 400px">${typeof debits[i] === 'undefined'? null: debits[i].description}</td>
                        <td >${typeof debits[i] === 'undefined'? null: debits[i].quantity}</td>
                        <td>${typeof debits[i] === 'undefined'? null: debits[i].type === 'credit' ? "খরচ":"জমা"}</td>
                        <td>${typeof debits[i] === 'undefined'? null:debits[i].ammount}</td>
                        <td>${i+1}</td>
                        <td style="word-wrap: break-word; max-width: 300px">${typeof credits[i] === 'undefined'? null:credits[i].description}</td>
                        <td>${typeof credits[i] === 'undefined'? null:credits[i].quantity}</td>
                        <td>${typeof credits[i] === 'undefined'? null:credits[i].type === 'credit' ? "খরচ":"জমা"}</td>
                        <td>${typeof credits[i] === 'undefined'? null:credits[i].ammount}</td>
                        </tr>
                            `;
                }
                let remainingOrnot = true;
                if(debitTotal - creditTotal < 0){
                    remainingOrnot = false;
                }else{
                    remainingOrnot = true;
                }
                let calc = `
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>Total = ${debitTotal}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>Total = ${creditTotal}</td>

                    </tr>
                    <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>অবশিষ্ট = ${remainingOrnot? Math.abs(debitTotal - creditTotal): 0}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td>বেশি খরচ = ${remainingOrnot? 0: Math.abs(debitTotal - creditTotal)}</td>

                    </tr>
                `;
                str += calc;
            }
            const table = `
            <div class="row">
                <table class="highlight col s12">
                    ${thead}
                    <tbody>
                        ${str} 
                    </tbody>
                </table>
            </div>
            `;
            resolve(table);
        });
    });
};


 const renderInstitute = async ()=>{
    document.querySelector('#data').innerHTML = await getRow('institute');
 }


const isDateFormat = (str)=>{
    let regex = new RegExp(/[0-9]+-[0-9x]+-[0-9x]+/g);
    let result = regex.exec(str);
    if(result){
        return true;
    }
    return false;
}

HTMLElement.prototype.printMe = printMe;
function printMe(query){
  var myframe = document.createElement('IFRAME');
  myframe.domain = document.domain;
  myframe.style.position = "absolute";
  myframe.style.top = "-10000px";
  document.body.appendChild(myframe);
  let top = document.createElement('div');
  top.innerHTML = `
    <div style="font-size: 32px;" class="titlebar white-text white col s12 green darken-3 center-align">
    <p style="font-size: 15px;">বিসমিল্লাহির রহমানির রহিম</p>
    মেসার্স শান্তা এন্টারপ্রাইজ
    <p style="text-align: end; font-size:12px;">
      প্রোঃ মোঃ শাহিন হোসেন<br>
      পদ্মা মোড়, বি আই ডি সি রোড, কাশিপুর, খালিশপুর, খুলনা</p>
    </div>
    <p>Search Result: ${document.querySelector('#search').value}</p>
    <p>Search Date: ${document.querySelector('#sdate').value}</p>
    ${this.innerHTML}
  `;
  myframe
  myframe.contentDocument.write(top.innerHTML) ;
  myframe.contentDocument.querySelector('table').border = "1px solid black";
  myframe.contentDocument.querySelector('table').style.borderCollapse = "collapse";
  myframe.contentDocument.querySelector('table').style.width = "100%";
  setTimeout(function(){
  myframe.focus();
  myframe.contentWindow.print();
  myframe.parentNode.removeChild(myframe) ;// remove frame
  },3000); // wait for images to load inside iframe
  window.focus();
 }


const bntoEng = (engNumb)=>{
    if(engNumb === null) return null;
    let cengn = "";
    const b2e = {
        '১':'1',
        '২':'2',
        '৩':'3',
        '৪':'4',
        '৫':'5',
        '৬':'6',
        '৭':'7',
        '৮':'8',
        '৯':'9',
        '০':'0',
    };
    for(let i = 0; i < engNumb.length; i++){
        cengn += b2e[`${engNumb[i]}`];
    }
    return parseInt(cengn);
};
const isBengaliNumber = (bnumb)=>{
    if(bnumb === null) return null;
    let stat = true;
    const barr = ['০', '১', '২','৩', '৪', '৫', '৬', '৭', '৮','৯'];
    for(let i = 0; i < bnumb.length; i++){
        if(barr.includes(bnumb[i]) === false){
            stat = false;
            return false;
        }
    }
    return stat;

}

const BdateToEng = (date)=>{
    if(isDateFormat(date)) return date;
    let newDate = "";
    const b2e = {
        '১':'1',
        '২':'2',
        '৩':'3',
        '৪':'4',
        '৫':'5',
        '৬':'6',
        '৭':'7',
        '৮':'8',
        '৯':'9',
        '০':'0',
    };
    for(let i= 0; i < date.length; i++){
        if(date[i] === '-'){
            newDate+= '-';
        }else{
            newDate += b2e[date[i]];
        }
    }
    return newDate;
}