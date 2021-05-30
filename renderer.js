window.addEventListener('DOMContentLoaded', async () => {
    const data = document.querySelector('#data');
    data.innerHTML = await getRow();
    initElemes();
});
  


const initElemes = ()=>{
    var elems = document.querySelectorAll('select');
    var elems2 = document.querySelectorAll('.modal');
    var instances = M.FormSelect.init(elems);
    M.Modal.init(elems2);
}