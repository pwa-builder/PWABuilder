export default function ({ route, redirect }) {
    if (route.path !== '/') {
        return;
    }
    return redirect('/generator');
}