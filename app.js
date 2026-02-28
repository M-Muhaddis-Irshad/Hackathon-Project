const supabaseApi = supabase.createClient('https://ubdfphgftdztmmfqoxmf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGZwaGdmdGR6dG1tZnFveG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzgwMDMsImV4cCI6MjA3Nzc1NDAwM30.SxvGOhgEIOTDXNajche0unZy4FfHFocaZVOW3lYh4H0')

const userEmail = localStorage.getItem('userEmail');
const userName = localStorage.getItem('userName');

let stopFunctionFlg = true;

// LogOut Query/Function____________________________
const logOutUser = async () => {
    const { error } = await supabaseApi.auth.signOut()
    if (error) {
        console.log(error)
    }
    else {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        stopFunctionFlg = false;
        Swal.fire({
            title: "SignOut Successfully",
            icon: "success",
            showConfirmButton: false,
            timer: 1500
        });
        setTimeout(() => {
            window.location.reload()
            window.location.href = 'allPages/auth/login/login.html';
        }, 1500);
    }
}




const loginBtn = document.getElementById('loginBtn');

// Initially check that User is loggedin or not_____________________________

const isUserLoggedIn = async () => {
    const { data: { session }, error } = await supabaseApi.auth.getSession()

    if (!stopFunctionFlg) {
        return
    }

    if (session === null) {
        // Swal.fire({
        //     title: "User isn't log in",
        //     icon: "error",
        //     showConfirmButton: false,
        //     timer: 1000
        // });
        // setTimeout(() => {
        //     window.location.href = 'allPages/auth/login/login.html';
        // }, 1000);
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        return
    }

    // After checking that session is not empty create a signout button______________________________
    loginBtn.innerHTML = `<a href="#" class="navLinks lastLink" id="signout">Signout <svg class="portal"></svg></a>`
    const signoutBtn = document.getElementById('signout');
    signoutBtn.addEventListener('click', async e => {
        e.preventDefault()
        await logOutUser()
    })

}

isUserLoggedIn()

{// Svg's Section__________________

    {// Svg's Start's__________________________________________

        const phoneSvg = document.getElementById('phoneSvg');
        const mailSvg = document.getElementById('mailSvg');
        const locationSvg = document.getElementById('locationSvg');

        // Phone Svg_________________________________________
        fetch('Logo_Icons/icons/sect1Svgs/mobile-phone.svg')
            .then(res => res.text())
            .then(data => {
                phoneSvg.innerHTML = data;
            });

        // Mail Svg_________________________________________
        fetch('Logo_Icons/icons/sect1Svgs/mail.svg')
            .then(res => res.text())
            .then(data => {
                mailSvg.innerHTML = data;
            });

        // Location Svg_________________________________________
        fetch('Logo_Icons/icons/sect1Svgs/location.svg')
            .then(res => res.text())
            .then(data => {
                locationSvg.innerHTML = data;
            });

    }


    { // About Cards Svg Start's

        const treatment = document.getElementById('treatment');
        const starOfLife = document.getElementById('starOfLife');
        const heartRate = document.getElementById('heartRate');
        const stethoscope = document.getElementById('stethoscope');

        // Treatment Svg_____________________________
        fetch("Logo_Icons/icons/aboutSectSvgs/caduceus.svg")
            .then(res => res.text())
            .then(data => treatment.innerHTML = data)

        // Star of Life Svg_____________________________
        fetch("Logo_Icons/icons/aboutSectSvgs/round-star-of-life.svg")
            .then(res => res.text())
            .then(data => starOfLife.innerHTML = data)

        // Heart Svg_____________________________
        fetch("Logo_Icons/icons/aboutSectSvgs/heart-rate.svg")
            .then(res => res.text())
            .then(data => heartRate.innerHTML = data)

        // Stethoscope Svg_____________________________
        fetch("Logo_Icons/icons/aboutSectSvgs/stethoscope.svg")
            .then(res => res.text())
            .then(data => stethoscope.innerHTML = data)

    }

}