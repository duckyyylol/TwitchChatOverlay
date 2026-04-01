import { json } from '@sveltejs/kit'

export const load = async ({cookies}) => {
    cookies.delete("token-0", {path: "/"})
    cookies.delete("token-r", {path: "/"})
    cookies.delete("transport-userdata", {path: "/"})
    
}