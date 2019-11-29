// var flags = { bools : {}, strings : {}, unknownFn: null };
// var a=[1,2,"b",0,{},"",NaN,3,undefined,null,5];
// function t(){
//     var obj = [].concat(a).filter(Boolean);
//     console.log(obj)
//     obj.forEach(function (key) {
//         flags.bools[key] = true;
//     });
// }

// t();
// console.log(flags)

// var aliases = {};
// const obj ={
//     a: 123
//     // b: true,
//     // c: [1,2,3]
// }
// Object.keys(obj).forEach(function (key) {
//     // 将obj的元素拷贝到aliases;
//     aliases[key] = [].concat(obj[key]);

//     aliases[key].forEach(function (x) {
//         // 将值作为key，key作为值来设置
//         aliases[x] = [key].concat(aliases[key].filter(function (y) {
//             return x !== y;
//         }));
//     });
// });

// console.log(aliases)

// console.log(process.argv)

// ==========================================================================

const minimist = require('./minimist');
var knownOptions = {
    string: 'env',
    default: { env: process.env.NODE_ENV || 'production',a:true }
  };
  
  var options = minimist(process.argv.slice(2), knownOptions);

  console.log(options)

//   node gulp1/test.js a b c --env="dev"
// { _: [ 'a', 'b', 'c' ], env: 'dev' }

// node gulp1/test.js a b c --env="dev"
// { _: [ 'a', 'b', 'c' ], env: 'dev', a: true }
// =======================================================================