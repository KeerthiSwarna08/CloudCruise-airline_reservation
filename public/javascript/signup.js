// Javascript validations
function validation(){
    var password = document.myform1.password.value;
    if (!validateEmail(document.getElementById('email').value.trim())) {
        var alert=alert('Email must be a valid email address!');
        return false;
        }
    if (password.length<6){
       var alert=alert("Password Must be 6 letters")
       return false;
    }  
        return true;
}

function validateEmail(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,15}(?:\.[a-z]{2})?)$/i;
        return isEmpty(email) || re.test(email);
        }
function isEmpty(str) { return (str.length === 0 || !str.trim()); }

