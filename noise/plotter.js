module.exports = function(inBytes){
    var i, j;
    var int;
    var str;
    
    for(i=0; i<inBytes.length; i++){
        
        int = parseInt(inBytes[i]);
        str = ("    " + int).slice(-4) + "|";
        
        for(j=0; j<int; j++){
            str += "-";
        }
        
        str += "+";
        console.log(str);
    }
};