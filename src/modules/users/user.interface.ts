export interface IUser {
    name:string,
    email:string,
    password:string,
    role:Role,
}

export enum Role{
    CONTRIBUTOR = "contributor",
    MAINTAINER = "maintainer"
}