export default function ({ route, redirect }) {
    if (route.name !== 'index') {
        return;
    }
    return redirect('/generator');
}