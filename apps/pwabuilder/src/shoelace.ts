// needed for manifest editor
import '@shoelace-style/shoelace/dist/components/button/button';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox';
import '@shoelace-style/shoelace/dist/components/color-picker/color-picker';
import '@shoelace-style/shoelace/dist/components/details/details';
import '@shoelace-style/shoelace/dist/components/divider/divider';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button';
import '@shoelace-style/shoelace/dist/components/input/input';
import '@shoelace-style/shoelace/dist/components/menu/menu';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item';
import '@shoelace-style/shoelace/dist/components/menu-label/menu-label';
import '@shoelace-style/shoelace/dist/components/select/select';
import '@shoelace-style/shoelace/dist/components/tab/tab';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel';
import '@shoelace-style/shoelace/dist/components/textarea/textarea';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip';
import '@shoelace-style/shoelace/dist/components/skeleton/skeleton';


// also needed for site
import '@shoelace-style/shoelace/dist/components/dialog/dialog';
import '@shoelace-style/shoelace/dist/components/icon/icon';
import '@shoelace-style/shoelace/dist/components/progress-ring/progress-ring';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group';
import '@shoelace-style/shoelace/dist/components/radio/radio';

// setting basepath so icons can be resolved
// see package.json where icons are copied to public folder during npm i
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
setBasePath('/assets/sl-icons');