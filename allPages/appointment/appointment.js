const supabaseApi = supabase.createClient('https://ubdfphgftdztmmfqoxmf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViZGZwaGdmdGR6dG1tZnFveG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNzgwMDMsImV4cCI6MjA3Nzc1NDAwM30.SxvGOhgEIOTDXNajche0unZy4FfHFocaZVOW3lYh4H0')

const userEmail = localStorage.getItem('userEmail');
const sessionName = localStorage.getItem('userName');

let stopFunctionFlg = true;

// LogOut Query/Function____________________________
const logOutUser = async () => {
    const { error } = await supabaseApi.auth.signOut()
    if (error) {
        return
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

// Auth End's'___________________________________________________



{// Stop the default behavior of <form>____________________________________
    const form = document.querySelector('form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        appoint()
    })
}

// Section of Appointment Booking form from DOM____________________________
const formSection = document.getElementById('formSection');

const retrieveBookings = async () => {

    const { data, error } = await supabaseApi
        .from('Appointments')
        .select('*')
        .eq('Email', userEmail)

    if (error) {
        console.log(error)
        return
    }

    if (data.length === 5) {
        formSection.classList.add('disabled_section');
        // Add class on parent element <main> cuz (cursor = not-allowed) isn't working with (pointer-events = none)_________________
        formSection.parentElement.classList.add('disableMain');
        formSection.parentElement.title = `Maximum of 5 appointments allowed per user`;
        Swal.fire({
            title: `Limit Reached`,
            text: 'Maximum of 5 appointments allowed per user',
            icon: "warning",
        });
        return
    }
}

retrieveBookings()

formSection.parentElement.addEventListener('click', event => {
    retrieveBookings()
})

// Use subscribe query for realtime changes_________________________
supabaseApi
    .channel('room1')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Appointments' }, payload => {
        retrieveBookings()
    })
    .subscribe()


// Set Name Input value dynamically_____________________________________________
document.getElementById('name').value = sessionName;


// Set a Authenticated email of user dynamically direct from session_______________
const email = document.getElementById('email');
email.value = userEmail;
email.disabled = true;


// Date from user______________________________________
const date = document.getElementById('date');

// Drop Downs_________________________________________
const doctors = document.getElementById('doctors');
const timing = document.getElementById('timing');
const domDaysContnr = document.getElementById('daysContainer');

// Drop Downs 1st Value Remove______________________________
const Val1 = document.querySelectorAll('.val0');

const dropDownsArray = [doctors, timing];

dropDownsArray.forEach((optionsValue, i) => {
    if (optionsValue[i] !== 0) {
        Val1[i].style.display = "none";
    }
})


// Final values from user_________________________
let finalDoc;
let finalTime;


// Save the selected Doctor Name & Days in a global variables for use in other functions__________________________________
let selectedDoctorIndex = null;
let selectedDoctorDaysArr = [];


// Function for booking the appointment Start's____________________________________________________
const appoint = async () => {

    const nameFromDom = document.getElementById('name').value;

    // Create the date object for for date selection conditions__________________________________
    const userDate = new Date(date.value);
    const todayDate = new Date();
    const maxDate = new Date();

    const slctdDay = userDate.getDate();
    const month = userDate.getMonth();
    const year = userDate.getFullYear();

    const selectedDate = `${slctdDay}/${month}/${year}`;

    maxDate.setDate(todayDate.getDate() + 40);

    // Array of Days______________________________
    const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const selectedDayIndex = userDate.getDay();
    const selectedDayName = daysArr[selectedDayIndex];
    // console.log(selectedDayName)

    const dayConditionVariable = selectedDoctorDaysArr.includes(selectedDayName, selectedDoctorDaysArr);
    // console.log(dayConditionVariable);

    // Conditions Start's_______________________________________________

    if (!nameFromDom.trim()) {
        Swal.fire({
            title: `Please enter the <span class="alertText">Name</span>`,
            icon: "error",
            showConfirmButton: false,
            timer: 1000
        });
        return
    }

    if (finalDoc === undefined || !finalDoc) {
        Swal.fire({
            title: `Select the <span class="alertText">Doctor</span>`,
            icon: "error",
            showConfirmButton: false,
            timer: 1500
        });
        return
    }

    if (!date.value.trim()) {
        Swal.fire({
            title: `Select the <span class="alertText">Date</span>`,
            icon: "error",
            showConfirmButton: false,
            timer: 1500
        });
        return
    }
    else if (userDate < todayDate || userDate > maxDate) {
        Swal.fire({
            title: `Please select the date between next <span class="alertText">40 Days</span>`,
            icon: "error",
            showConfirmButton: false,
            timer: 1500
        });
        return
    }

    if (finalTime === undefined || !finalTime) {
        Swal.fire({
            title: `Select the <span class="alertText">Time</span>`,
            icon: "error",
            showConfirmButton: false,
            timer: 1500
        });
        return
    }

    if (dayConditionVariable === false) {
        Swal.fire({
            title: `Please select another <span class="alertText">Date</span>`,
            html: `${finalDoc} is not available on <span class="alertText">${selectedDayName}</span>`,
            icon: "error",
            showConfirmButton: false,
            timer: 2000
        });
        return
    }


    // Conditions End's_______________________________________________

    const userName = (nameFromDom !== sessionName) ? nameFromDom : sessionName;

    // console.log(`
    //     Name = ${userName}
    //     Email = ${email.value}
    //     Doctor = ${finalDoc}
    //     Date = ${selectedDate}
    //     Day = ${selectedDayName}
    //     Time = ${finalTime}
    //     `
    // );

    const { error } = await supabaseApi
        .from('Appointments')
        .insert({ Name: userName, Email: email.value, Doctor: finalDoc, Date: selectedDate, Day: selectedDayName, Time: finalTime })

    if (error) {
        Swal.fire({
            title: error.message,
            icon: "error",
            showConfirmButton: false,
            timer: 1500
        });
        return
    }


    Swal.fire({
        title: "Appointment Booked Successfully",
        icon: "success",
        showConfirmButton: false,
        timer: 1000
    });
    setTimeout(() => {
        window.location.href = '../bookings/myBookings.html';
    }, 1000);

}

// Function for booking the appointment End's____________________________________________________




// Array with the same index no. which is show in options for find the exact (Day & Time)______
const docNamesArr = [];

// Retrieve a session from supabase and set the values on DropDowns_____
const retrieve = async () => {

    const { data, error } = await supabaseApi
        .from('DoctorsData')
        .select('Data')

    if (error) {
        console.log(error.message)
        return
    }

    let Data = data[0].Data;

    // Run loop on Data for set the names of doctors in the html <options> tag & push into the Docs names Array__________________ 
    Data.forEach((docs, index) => {
        const { Doctor: { Name } } = docs
        docNamesArr.push(Name[0]);
        doctors.innerHTML += `<option value="${index}">${Name}</option>`;
    });

    {    // Disable the date, day & time elements before doctor selection_____________________

        date.disabled = true;
        date.style.cursor = 'not-allowed';

        timing.disabled = true;
        timing.style.cursor = 'not-allowed';
    }

    doctors.addEventListener('change', event => {

        {// Reset the values of (Date, Days & Time) on every Doctor change____________________

            // Reset values from DOM_____________________________
            timing.options.length = 1
            timing.style.cursor = 'pointer';

            // Reset values from JS variables_____________________________
            finalDoc = "";
            date.value = "";
            date.style.cursor = 'pointer';
            selectedDoctorDaysArr = [];
            domDaysContnr.innerHTML = "";
            finalTime = "";
        };

        // Here is the doctor value  that is come from doctors dropDown from (index 0 to 5)____________
        selectedDoctorIndex = event.target.value;

        const { Doctor: { Days, Timings } } = Data[selectedDoctorIndex];

        finalDoc = docNamesArr[selectedDoctorIndex];

        {// Channge the heading from DOM on doctor selection__________________
            document.getElementById("availableDaysHeading").innerHTML = `<span class="docNameOnAvlblDaysHeading">${finalDoc}</span> is available on these days`
        }

        {// Enable the Date, Day & Time dropdowns on doctor selection________________
            date.disabled = false;
            timing.disabled = false;
        }

        {//Set values in (Date & Time) options after getting the Doctor Name
            Days.forEach(days => {
                selectedDoctorDaysArr.push(days);

                domDaysContnr.innerHTML += `
                    <div class="avlblDays">
                        ${days}
                    </div>
                `
            })

            Timings.forEach(timings => {
                timing.innerHTML += `<option value="${timings}">${timings}</option>`
            })
        }

    });

    timing.addEventListener('change', event => {
        finalTime = event.target.value;
    });

}

retrieve()

// { // Doctors Data with (insert) & (delete) queries______________________
//     const doctorsData = [
//         {
//             "Doctor": {
//                 "Name": ["Dr. Ali"],
//                 "Days": [
//                     "Monoday",
//                     "Tuesday",
//                     "Wednesday",
//                     "Thursday",
//                     "Friday"
//                 ],
//                 "Timings": ["8:00AM - 1:00PM", "1:00PM - 5:30PM"]
//             }
//         },
//         {
//             "Doctor": {
//                 "Name": ["Dr. Ayesha"],
//                 "Days": [
//                     "Monoday",
//                     "Tuesday",
//                     "Wednesday",
//                     "Thursday",
//                     "Friday"
//                 ],
//                 "Timings": ["8:00AM - 1:00PM", "1:00PM - 5:30PM"]
//             }
//         },
//         {
//             "Doctor": {
//                 "Name": ["Dr. Ahmed"],
//                 "Days": [
//                     "Monoday",
//                     "Tuesday",
//                     "Wednesday",
//                     "Thursday",
//                     "Friday"
//                 ],
//                 "Timings": ["8:00AM - 1:00PM", "1:00PM - 5:30PM"]
//             }
//         },
//         {
//             "Doctor": {
//                 "Name": ["Dr. Rehan"],
//                 "Days": [
//                     "Monoday",
//                     "Tuesday",
//                     "Wednesday",
//                     "Thursday",
//                     "Friday"
//                 ],
//                 "Timings": ["8:00AM - 1:00PM", "1:00PM - 5:30PM"]
//             }
//         },
//         {
//             "Doctor": {
//                 "Name": ["Dr. Sara"],
//                 "Days": [
//                     "Saturday",
//                     "Sunday"
//                 ],
//                 "Timings": ["9:30AM - 1:00PM", "1:00PM - 5:30PM"]
//             }
//         },
//         {
//             "Doctor": {
//                 "Name": ["Dr. Salman"],
//                 "Days": [
//                     "Saturday",
//                     "Sunday"
//                 ],
//                 "Timings": ["9:30AM - 1:00PM", "1:00PM - 5:30PM"]
//             }
//         }
//     ]

//     {// Supabase Insert & Delete Query_______________________________

//         const insert = async () => {
//             const { error } = await supabaseApi
//                 .from('DoctorsData')
//                 .insert(
//                     {
//                         id: 1,
//                         Data: doctorsData
//                     }
//                 )

//             if (error) {
//                 console.log(error.message)
//                 return
//             }
//         }
//         // insert()


//         const Delete = async () => {
//             const response = await supabaseApi
//                 .from('DoctorsData')
//                 .delete()
//                 .eq('id', 1)
//             console.log(response);

//         }

//         // Delete()
//     }
// }