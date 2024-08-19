export enum Error {
    MONGO_SERVER_ERROR = 'MongoServerError',
    BAD_REQUEST_EXCEPTION = 'BadRequestException'
}

export const mongoServerErrors = {
    DUPLICATE_ENTITY: {
        code: 11000,
        message: "entity already exists",
        error: "Duplicate Entity"
    },
    DEFAULT: {
        code: 0,
        message: "an error occured in the database",
        error: "Mongo Error"
    },

}