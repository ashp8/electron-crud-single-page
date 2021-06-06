
const {app} = require('electron');
const { rmSync } = require('original-fs');
const sqlite3 = require('sqlite3');

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
        let inputs = ["editcomment", "editdue", "editammount", 'editquantity', 'editdescription', 'editinstid'];
            inputs.forEach(ids =>{
                let inp = document.querySelector(`#${ids}`);
                if(inp.value === "" || inp.value === undefined || inp.value === null){
                    datas[inp.id] = null;     
                }else{
                    datas[inp.id] = inp.value;     
                }
            });
            datas.editdue =  isNaN(datas.editdue)? null:datas.editdue ;
            datas.editammount =  isNaN(datas.editammount)? null:datas.editammount ;
            datas.editquantity =  isNaN(datas.editquantity)? null:datas.editquantity ;
            datas.editinstid =  isNaN(parseinstId(datas.editinstid))? null:parseinstId(datas.editinstid);
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
              <th>SL No</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Due</th>
              <th>type</th>
              <th>Institution Name</th>
              <th>Ammount</th>
              <th>Date</th>
              <th></th>
          </tr>
        </thead> 
    `;
    let str = "";
    let sql;
    if(types === 'credit'){
        if(isDateFormat(search)){
            sql = `select * from institute inner join accounts on institute.id=accounts.instid where accounts.type="credit" and accounts.date like '%${search}%'`;
        }else{
            sql = search === null ? 'select * from institute inner join accounts on institute.id=accounts.instid where accounts.type="credit"': `select institute.name, accounts.id, accounts.description, accounts.quantity, accounts.ammount, accounts.due, accounts.type, accounts.date from institute inner join accounts on institute.id=accounts.instid where type="credit" and institute.name like "%${search}%"`;
        }
    }else if(types === 'debit'){
        if(isDateFormat(search)){
            sql = `select * from institute inner join accounts on institute.id=accounts.instid where accounts.type="debit" and accounts.date like '%${search}%'`;
        }else{
        // sql = 'select * from accounts where type="debit"';
            sql = search === null ? 'select * from institute inner join accounts on institute.id=accounts.instid where accounts.type="debit"': `select institute.name, accounts.id, accounts.description, accounts.quantity, accounts.ammount, accounts.due, accounts.type, accounts.date from institute inner join accounts on institute.id=accounts.instid where type="credit" and institute.name like "%${search}%"`;
        };
    }else if(types === 'institute'){
        sql = 'select * from institute';
        thead = `
        <thead>
          <tr>
              <th>SL No</th>
              <th>Name</th>
              <th>Details</th>
              <th>Contacts</th>
              <th></th>
          </tr>
        </thead> 
    `;
    }
    else if(types === 'all'){
        // sql = 'select * from accounts';
        sql=`select * from institute inner join accounts on institute.id=accounts.instid`;
    }else{
        // sql = 'select * from accounts';
        sql=`select * from institute inner join accounts on institute.id=accounts.instid`;
    }
    return new Promise((resolve, reject)=>{
    db.all(sql,[], (err, row)=>{
            if(row){
                console.log(row);
                row.forEach((a, index)=>{
                    if(types === 'institute'){
                        str+=`<tr>
                        <td>${index}</td>
                        <td class="tds">${a.name}</td>
                        <td>${a.details}</td>
                        <td>${a.contacts}</td>
                        <td style="table-layout:fixed;width:20px;overflow:hidden;"><button href="#modal1" onclick="instOp(${a.id})" class="btn btn-small waves-effect waves-light cyan modal-trigger">c</button></td>
                        </tr>`;
                    }
                    else{
                    str+=`<tr>
                        <td>${index}</td>
                        <td class="tds">${a.description}</td>
                        <td>${a.quantity}</td>
                        <td>${a.due}</td>
                        <td>${a.type}</td>
                        <td class="tds">${a.name}</td>
                        <td>${a.ammount}</td>
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
                <input id="addinstid" list="brow" placeholder="Institute Name" class="input-field col s12">
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
                <label for="adddescription">Description</label>
            </div>
            <div class="input-field col s12">
                <input id="addquantity" type="text" class="validate"/>
                <label for="addquantity">Quantity</label>
            </div>
            <div class="input-field col s12">
                <input id="addammount" type="text" class="validate"/>
                <label for="addammount">Ammount</label>
            </div>
            <div class="input-field col s12">
                <input id="adddue" type="text" class="validate"/>
                <label for="adddue">Due</label>
            </div>
            <div class="input-field col s12">
                <input id="addcomment" type="text" class="validate"/>
                <label for="addcomment">addcomment</label>
            </div>
        </div>
    `;
    const instinp = `
         <div class="input-field col s12">
                <input id="instname" type="text" class="validate"/>
                <label for="instname">Institue Name</label>
            </div>
            <div class="input-field col s12">
                <input id="instdetail" type="text" class="validate"/>
                <label for="instdetail">Details</label>
            </div>
            <div class="input-field col s12">
                <input id="instcontacts" type="text" class="validate"/>
                <label for="instcontacts">Contacts</label>
            </div>
    `;
    const addForm = `
        <div class="modal-content green lighten-4">
        <div class="card-panel addpanel green lighten-5" style="max-height:360px; overflow:scroll;">
            <div class="row">
                <div calss="col s12" style="padding: 0 10px;">
                    <select id="sInsSM">
                            <option value="debit">debit</option>
                            <option value="credit">credit</option>
                            <option value="institute">institute</option>
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
                alert('selected value is debit by default');
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
                <input value="${instName.name} $${instName.id}" id="editinstid" list="brow2" placeholder="Institute Name" class="input-field col s12">
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
                <label for="editdescription">Description</label>
            </div>
            <div class="input-field col s12">
                <input value="${acccountinfo.quantity}" id="editquantity" type="text" class="validate"/>
                <label for="editquantity">Quantity</label>
            </div>
            <div class="input-field col s12">
                <input value="${acccountinfo.ammount}" id="editammount" type="text" class="validate"/>
                <label for="editammount">Ammount</label>
            </div>
            <div class="input-field col s12">
                <input value="${acccountinfo.due}" id="editdue" type="text" class="validate"/>
                <label for="editdue">Due</label>
            </div>
            <div class="input-field col s12">
                <input value="${acccountinfo.comment}"  id="editcomment" type="text" class="validate"/>
                <label for="editcomment">addcomment</label>
            </div>
        </div>
    `;
    const addForm = `
        <div class="modal-content green lighten-4">
        <div class="card-panel addpanel green lighten-5" style="max-height:360px; overflow:scroll;">
            <div class="row">
                <div calss="col s12" style="padding: 0 10px;">
                    <select id="edittypeSelect">
                            <option value="${acccountinfo.type}">${acccountinfo.type}</option>
                            <option value="debit">debit</option>
                            <option value="credit">credit</option>
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
    console.log(data, id);
    const sql = `update accounts set 
        description="${data.editdescription}",
        quantity=${data.editquantity},
        ammount=${data.editammount},
        due=${data.editdue},
        instid=${data.editinstid},
        type="${data.type}",
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
    console.log("function called");
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
            dataM.innerHTML = await getAll(search.value);
        }else if(value === 'credit'){
            document.querySelector('#data').innerHTML = await getRow('credit', search.value);
        }else if(value === 'debit'){
            document.querySelector('#data').innerHTML = await getRow('credit', search.value);
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
              <th>SL No</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Ammount</th>
              <th>SL No</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Ammount</th>
          </tr>
        </thead> 
    `;
     let str = "";
     let str2 = "";
     let p1 = 0, p2 = 0;
    return new Promise((resolve, reject)=>{
        let sql;
        if(isDateFormat(date)){
            sql = `select * from accounts where date="${date}"`;
        }else{
            sql = `select institute.name, accounts.id, accounts.description, accounts.quantity, accounts.ammount, accounts.due, accounts.type, accounts.date from institute inner join accounts on institute.id=accounts.instid where institute.name like "%${date}%";`
        }
       
        db.all(sql,[], (err, row)=>{
            console.log(row);
            if(row){
                const credits = row.filter(e=>e.type ==='credit');
                const debits = row.filter(e=>e.type ==='debit');
                for(let i = 0; i < Math.max(credits.length, debits.length); i++){
                    str+=`<tr>
                        <td style="text-align: center;">${i+1}</td>
                        <td style="word-wrap: break-word; max-width: 400px">${typeof debits[i] === 'undefined'? null: debits[i].description}</td>
                        <td style="text-align: center;">${typeof debits[i] === 'undefined'? null: debits[i].quantity}</td>
                        <td style="text-align: center;">${typeof debits[i] === 'undefined'? null:debits[i].ammount}</td>
                        <td style="text-align: center;">${i+1}</td>
                        <td style="word-wrap: break-word; max-width: 300px">${typeof credits[i] === 'undefined'? null:credits[i].description}</td>
                        <td style="text-align: center;">${typeof credits[i] === 'undefined'? null:credits[i].quantity}</td>
                        <td style="text-align: center;">${typeof credits[i] === 'undefined'? null:credits[i].ammount}</td>
                        </tr>
                            `;
                }
                
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
    let regex = new RegExp(/[0-9x]+-[0-9x]+-[0-9x]+/g);
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
  myframe.contentDocument.write(this.innerHTML) ;
  console.log(myframe)
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
