// This middleware is used for preserve old routes
export default ({ route, redirect }) => {
    if (route.path !== '/generator') {
        return;
    }

    return redirect('/');
}