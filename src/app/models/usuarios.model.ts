export class Usuario {
    constructor(
        public nombre?: string,
        public email?: string,
        public password?: string,
        public passwordConfirm?: string,
        public role?: string,
        public empresas?: string,
        public img?: string,
        public rutaImg?:string,
        public _id?: string
    ) {}
}