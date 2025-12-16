
export const registerValidator = {
    username: {
        in: ['body'],
        isString:true,
        trim: true,
        isLength: {
            options: { min: 3, max: 50 },
            errorMessage: 'Username must be between 3 and 50 characters long'
        },
    },
    email: {
        in: ['body'],
        isEmail: {
            errorMessage: 'Invalid email format'
        },
        normalizeEmail: true,
    },
    password: {
        in: ['body'],
        isString: true,
        isLength: {
            options: { min: 8, max: 128 },
            errorMessage: 'Password must be at least 8 characters long'
        },
        trim: true,
    }
}

export const loginValidator = {
    email: {
        in: ['body'],
        isEmail: {
            errorMessage: 'Invalid email format'
        },
        normalizeEmail: true,
    },
    password: {
        in: ['body'],
        isString: true,
        notEmpty: {
            errorMessage: 'Password cannot be empty'
        },
        trim: true,
    }
}