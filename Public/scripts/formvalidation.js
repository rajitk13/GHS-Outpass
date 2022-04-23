$('#form').validate({
    rules: {
        name: {
            required: true,
            minlength: 3
        },
        registration: {
            required: true,
            minlength: 3
        },
        email: {
            required: true,
            email: true
        },
        warden: {
            required: true,
            minlength: 3
        },
        block: {
            required: true,
            minlength: 3
        },
        reason: {
            required: true,
            minlength: 3
        }
    } });