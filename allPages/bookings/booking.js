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
            window.location.href = '/allPages/auth/login/login.html';
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
        Swal.fire({
            title: "User isn't log in",
            icon: "error",
            showConfirmButton: false,
            timer: 1000
        });
        setTimeout(() => {
            window.location.href = '../auth/login/login.html';
        }, 1000);
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

const deleteAppointment = async (id) => {
    const { data, error } = await supabaseApi
        .from('Appointments')
        .delete()
        .eq('id', id)
        .select('*')

    if (error) {
        return alert(error.message)
    }

    Swal.fire({
        title: "Appointment Canceled",
        icon: "success",
        showConfirmButton: false,
        timer: 1000
    });

}

// DOM Elements__________________________________________________

const mainTag = document.getElementById('bodyContent');
const tBody = document.getElementById('tableContent');

const retrieve = async () => {

    tBody.innerHTML = ''

    const { data, error } = await supabaseApi
        .from('Appointments')
        .select('*')
        .eq('Email', userEmail)

    if (error) {
        console.log(error)
        return
    }

    // console.log(data)

    if (data.length === 0) {
        mainTag.innerHTML = `
        <h1 class="noAppointmentsMsg">
            You haven't booked any appointments yet
        </h1>
        `
        return
    }

    data.forEach(bookings => {
        // Get User's Booked Appointments according to User's Email________________________

        // console.log(bookings)
        const { Name: PName, Doctor, Date, Time, id } = bookings
        tBody.innerHTML += `
                <tr>
                    <td>${PName}</td>
                    <td>${Doctor}</td>
                    <td>${Date}</td>
                    <td>${Time}</td>
                    <td>
                        <button id="dltBooking${id}">
                            Cancel
                        </button>
                    </td>
                </tr>

        `
        setTimeout(() => {
            const cancelBtn = document.getElementById(`dltBooking${id}`)
            cancelBtn.addEventListener('click', async e => {
                // console.log(e.target.id)
                deleteAppointment(id)
            })
        }, 0);


    });


}

retrieve()

// Use subscribe query for realtime changes_________________________
supabaseApi
    .channel('room1')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Appointments' }, payload => {
        retrieve()
    })
    .subscribe()