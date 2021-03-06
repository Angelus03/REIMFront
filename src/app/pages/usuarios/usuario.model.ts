import { Cliente } from "../../models/cliente.models";

export class Usuario {
    constructor(
        public nombre?: string,
        public email?: string,
        public password?: string,
        public passwordConfirm?: string,
        public role?: string,
        public empresas?: Cliente[],
        public img?: string,
        public rutaImg?: string,
        public status?: boolean,
        public _id?: string
    ) {}
}
