document.getElementById('app').onclick = function(){
    console.log('abab')
}

function fn(){
    console.log('test fn')
}

const coo = () => {
    console.log('测试 es6语法')
}

coo()

const data = {
    name: 'index'
}

const values = Object.values(data);
$('.wrapper').html(values)