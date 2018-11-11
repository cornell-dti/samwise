import firebase_admin
from firebase_admin import credentials, auth

cred = credentials.Certificate('app/serviceAccount.json')
default_app = firebase_admin.initialize_app(cred)


html = '''
<script src="https://www.gstatic.com/firebasejs/5.5.8/firebase.js"></script>
<script>
    var config = {
        apiKey: "AIzaSyBrnR-ai3ZQrr3aYnezDZTZdw9e2TWTRtc",
        authDomain: "dti-samwise.firebaseapp.com",
        databaseURL: "https://dti-samwise.firebaseio.com",
        projectId: "dti-samwise",
        storageBucket: "dti-samwise.appspot.com",
        messagingSenderId: "114434220691"
    };
    firebase.initializeApp(config);

    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    firebase.auth().useDeviceLanguage();
    provider.setCustomParameters({
        'login_hint': 'user@example.com'
    });

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
                window.location.replace(window.location + '&token=' + idToken);
            }).catch(function(error) {
                console.log(error);
            });    
        } else {
            firebase.auth().signInWithRedirect(provider);
            firebase.auth().getRedirectResult().then(function(result) {
                var token = result.credential.accessToken;
                var user = result.user;
            }).catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                var email = error.email;
                var credential = error.credential;
            });
        }
    });
</script>
'''