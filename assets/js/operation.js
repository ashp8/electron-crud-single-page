
const {app} = require('electron');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('db.sqlite3', (err)=>{
    if(err){
        return console.error(err.message);
    }
    console.log("connected to the database");
});

const dbOp = ()=>{
    return `
        
        <select class="" name="dbOp" id="dbOp" value="OP" style="width: 64px; font-size:12px;">
            <option value="" disabled selected>OP</disabled>
            <option value="update">update</option>
            <option value="delete">delete</option>
        </select>
        
    `;
}

const getRow = ()=>{
    const thead = `
        <thead>
          <tr>
              <th>SL No</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th></th>
              <th></th>
          </tr>
        </thead> 
    `;
    
    let str = "";
    const sql = 'select * from people';
    return new Promise((resolve, reject)=>{
        db.all(sql,[], (err, row)=>{
        row.forEach((a, index)=>{
            str+=`<tr>
            <td>${index}</td>
            <td>${a.first_name}</td>
            <td>${a.last_name}</td>
            <td style="table-layout:fixed;width:100px;">${dbOp()}</select></td>
            <td style="table-layout:fixed;width:20px;overflow:hidden;"><button>chng</button></td>
            </tr>`;
        });

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