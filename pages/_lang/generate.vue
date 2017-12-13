<template>
<section>
    <GeneratorMenu first-link-path='generate' />
    <div class="l-generator-step">
        <div class="pwa-generator-form pure-u-1 pure-u-md-1-2">
            <h4 class="pwa-generator-subtitle">
                Here are the values we picked up from your site.
            </h4>
            <h4 class="pwa-generator-subtitle pwa-generator-subtitle--last">
                Update or add any details below.
            </h4>
            <div class="pwa-generator-field">
                <label class="pwa-generator-label">Name
                    <a class="pwa-generator-link" href="https://www.w3.org/TR/appmanifest/#name-member" target="_blank">[?]</a>
                </label>
                <input id="ember528" class="ember-view ember-text-field pwa-generator-input" type="text">
            </div>
            <div class="pwa-generator-field">
                <label class="pwa-generator-label">Short Name
                    <a class="pwa-generator-link" href="https://www.w3.org/TR/appmanifest/#short_name-member" target="_blank">[?]</a>
                </label>
                <input id="ember529" class="ember-view ember-text-field pwa-generator-input" name="short_name" type="text">
            </div>
            <div class="pwa-generator-field">
                <label class="pwa-generator-label">Description
                    <a class="pwa-generator-link" href="https://www.w3.org/TR/appmanifest/#description-member" target="_blank">[?]</a>
                </label>
                <input id="ember530" class="ember-view ember-text-field pwa-generator-input" name="description" type="text">
            </div>
            <div class="pwa-generator-field logo-upload">
                <label class="pwa-generator-label">Icon Url
                    <a class="pwa-generator-link" href="https://www.w3.org/TR/appmanifest/#icons-member" target="_blank">[?]</a>
                </label>
                <div id="ember539" class="ember-view">
                    <input id="ember585" class="ember-view ember-text-field pwa-generator-input" placeholder="http://example.com/image.png or /images/example.png"
                        type="url">

                    <div class="button-holder icons">
                        <div id="ember594" class="ember-view l-inline">
                            <button data-ember-action="597" class="pwa-button pwa-button--text isEnabled">
                                Or upload an image...
                            </button>

                            <!---->
                            <!---->
                        </div>
                        <button class="pwa-button pwa-button--text pwa-button--right" data-ember-action="595" disabled="">
                            <!---->Add Icon
                        </button>

                        <!---->
                    </div>

                    <div class="pure-g pwa-generator-table">
                        <div class="pure-u-10-24 pwa-generator-tableh">Preview</div>
                        <div class="pure-u-8-24 pwa-generator-tableh">Size</div>
                        <div class="pure-u-1-8"></div>
                        <div class="pure-u-1-8"></div>

                        <div class="pure-u-10-24 pwa-generator-tablec">
                            <a target="_blank" href="">
                                <img class="icon-preview" src="http://google.es/images/branding/product/ico/googleg_lodp.ico">
                            </a>
                        </div>
                        <div class="pure-u-8-24 pwa-generator-tablec">
                            16x16 32x32
                        </div>
                        <div class="pure-u-1-8 pwa-generator-tablec">
                            <!---->
                        </div>
                        <div class="pure-u-1-8 pwa-generator-tablec pwa-generator-tablec--right">
                            <span class="pwa-generator-close" data-ember-action="601">
                                <i class="fa fa-times" aria-hidden="true"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="pwa-generator-field">
                <label class="pwa-generator-label">Scope
                    <a class="pwa-generator-link" href="https://www.w3.org/TR/appmanifest/#scope-member" target="_blank">[?]</a>
                </label>
                <input id="ember540" class="ember-view ember-text-field pwa-generator-input" type="text">
            </div>
            <div class="pwa-generator-field">
                <label class="pwa-generator-label">Start Url
                    <a class="pwa-generator-link" href="https://www.w3.org/TR/appmanifest/#start_url-member" target="_blank">[?]</a>
                </label>
                <input id="ember541" class="ember-view ember-text-field pwa-generator-input" type="text">
            </div>
            <div class="pwa-generator-field">
                <label class="pwa-generator-label">Display
                    <a class="pwa-generator-link" href="https://www.w3.org/TR/appmanifest/#display-member" target="_blank">[?]</a>
                </label>
                <select id="ember552" class="ember-view ember-select pwa-generator-input pwa-generator-input--select">
                    <!---->
                    <option id="ember604" class="ember-view" value="fullscreen">fullscreen</option>
                    <option id="ember605" class="ember-view" value="standalone">standalone</option>
                    <option id="ember606" class="ember-view" value="minimal-ui">minimal-ui</option>
                    <option id="ember607" class="ember-view" value="browser">browser</option>
                </select>
            </div>
            <div class="pwa-generator-field">
                <label class="pwa-generator-label">Orientation
                    <a class="pwa-generator-link" href="https://www.w3.org/TR/appmanifest/#orientation-member" target="_blank">[?]</a>
                </label>
                <select id="ember553" class="ember-view ember-select pwa-generator-input pwa-generator-input--select">
                    <!---->
                    <option id="ember608" class="ember-view" value="any">any</option>
                    <option id="ember609" class="ember-view" value="natural">natural</option>
                    <option id="ember610" class="ember-view" value="landscape">landscape</option>
                    <option id="ember611" class="ember-view" value="portrait">portrait</option>
                    <option id="ember612" class="ember-view" value="portrait-primary">portrait-primary</option>
                    <option id="ember613" class="ember-view" value="portrait-secondary">portrait-secondary</option>
                    <option id="ember614" class="ember-view" value="landscape-primary">landscape-primary</option>
                    <option id="ember615" class="ember-view" value="landscape-secondary">landscape-secondary</option>
                </select>
            </div>
            <div class="pwa-generator-field">
                <label class="pwa-generator-label">Language
                    <a class="pwa-generator-link" href="https://www.w3.org/TR/appmanifest/#lang-member" target="_blank">[?]</a>
                </label>
                <select id="ember554" class="ember-view ember-select pwa-generator-input pwa-generator-input--select">
                    <!---->
                    <option id="ember616" class="ember-view" value=""> </option>
                    <option id="ember617" class="ember-view" value="ab">Abkhaz</option>
                    <option id="ember618" class="ember-view" value="aa">Afar</option>
                    <option id="ember619" class="ember-view" value="af">Afrikaans</option>
                    <option id="ember620" class="ember-view" value="ak">Akan</option>
                    <option id="ember621" class="ember-view" value="sq">Albanian</option>
                    <option id="ember622" class="ember-view" value="am">Amharic</option>
                    <option id="ember623" class="ember-view" value="ar">Arabic</option>
                    <option id="ember624" class="ember-view" value="an">Aragonese</option>
                    <option id="ember625" class="ember-view" value="hy">Armenian</option>
                    <option id="ember626" class="ember-view" value="as">Assamese</option>
                    <option id="ember627" class="ember-view" value="av">Avaric</option>
                    <option id="ember628" class="ember-view" value="ae">Avestan</option>
                    <option id="ember629" class="ember-view" value="ay">Aymara</option>
                    <option id="ember630" class="ember-view" value="az">Azerbaijani</option>
                    <option id="ember631" class="ember-view" value="bm">Bambara</option>
                    <option id="ember632" class="ember-view" value="ba">Bashkir</option>
                    <option id="ember633" class="ember-view" value="eu">Basque</option>
                    <option id="ember634" class="ember-view" value="be">Belarusian</option>
                    <option id="ember635" class="ember-view" value="bn">Bengali</option>
                    <option id="ember636" class="ember-view" value="bh">Bihari</option>
                    <option id="ember637" class="ember-view" value="bi">Bislama</option>
                    <option id="ember638" class="ember-view" value="bs">Bosnian</option>
                    <option id="ember639" class="ember-view" value="br">Breton</option>
                    <option id="ember640" class="ember-view" value="bg">Bulgarian</option>
                    <option id="ember641" class="ember-view" value="my">Burmese</option>
                    <option id="ember642" class="ember-view" value="ca">Catalan; Valencian</option>
                    <option id="ember643" class="ember-view" value="ch">Chamorro</option>
                    <option id="ember644" class="ember-view" value="ce">Chechen</option>
                    <option id="ember645" class="ember-view" value="ny">Chichewa; Chewa; Nyanja</option>
                    <option id="ember646" class="ember-view" value="zh">Chinese</option>
                    <option id="ember647" class="ember-view" value="cv">Chuvash</option>
                    <option id="ember648" class="ember-view" value="kw">Cornish</option>
                    <option id="ember649" class="ember-view" value="co">Corsican</option>
                    <option id="ember650" class="ember-view" value="cr">Cree</option>
                    <option id="ember651" class="ember-view" value="hr">Croatian</option>
                    <option id="ember652" class="ember-view" value="cs">Czech</option>
                    <option id="ember653" class="ember-view" value="da">Danish</option>
                    <option id="ember654" class="ember-view" value="dv">Divehi; Dhivehi; Maldivian;</option>
                    <option id="ember655" class="ember-view" value="nl">Dutch</option>
                    <option id="ember656" class="ember-view" value="en">English</option>
                    <option id="ember657" class="ember-view" value="eo">Esperanto</option>
                    <option id="ember658" class="ember-view" value="et">Estonian</option>
                    <option id="ember659" class="ember-view" value="ee">Ewe</option>
                    <option id="ember660" class="ember-view" value="fo">Faroese</option>
                    <option id="ember661" class="ember-view" value="fj">Fijian</option>
                    <option id="ember662" class="ember-view" value="fi">Finnish</option>
                    <option id="ember663" class="ember-view" value="fr">French</option>
                    <option id="ember664" class="ember-view" value="ff">Fula; Fulah; Pulaar; Pular</option>
                    <option id="ember665" class="ember-view" value="gl">Galician</option>
                    <option id="ember666" class="ember-view" value="ka">Georgian</option>
                    <option id="ember667" class="ember-view" value="de">German</option>
                    <option id="ember668" class="ember-view" value="el">Greek, Modern</option>
                    <option id="ember669" class="ember-view" value="gn">Guaraní</option>
                    <option id="ember670" class="ember-view" value="gu">Gujarati</option>
                    <option id="ember671" class="ember-view" value="ht">Haitian; Haitian Creole</option>
                    <option id="ember672" class="ember-view" value="ha">Hausa</option>
                    <option id="ember673" class="ember-view" value="he">Hebrew (modern)</option>
                    <option id="ember674" class="ember-view" value="hz">Herero</option>
                    <option id="ember675" class="ember-view" value="hi">Hindi</option>
                    <option id="ember676" class="ember-view" value="ho">Hiri Motu</option>
                    <option id="ember677" class="ember-view" value="hu">Hungarian</option>
                    <option id="ember678" class="ember-view" value="ia">Interlingua</option>
                    <option id="ember679" class="ember-view" value="id">Indonesian</option>
                    <option id="ember680" class="ember-view" value="ie">Interlingue</option>
                    <option id="ember681" class="ember-view" value="ga">Irish</option>
                    <option id="ember682" class="ember-view" value="ig">Igbo</option>
                    <option id="ember683" class="ember-view" value="ik">Inupiaq</option>
                    <option id="ember684" class="ember-view" value="io">Ido</option>
                    <option id="ember685" class="ember-view" value="is">Icelandic</option>
                    <option id="ember686" class="ember-view" value="it">Italian</option>
                    <option id="ember687" class="ember-view" value="iu">Inuktitut</option>
                    <option id="ember688" class="ember-view" value="ja">Japanese</option>
                    <option id="ember689" class="ember-view" value="jv">Javanese</option>
                    <option id="ember690" class="ember-view" value="kl">Kalaallisut, Greenlandic</option>
                    <option id="ember691" class="ember-view" value="kn">Kannada</option>
                    <option id="ember692" class="ember-view" value="kr">Kanuri</option>
                    <option id="ember693" class="ember-view" value="ks">Kashmiri</option>
                    <option id="ember694" class="ember-view" value="kk">Kazakh</option>
                    <option id="ember695" class="ember-view" value="km">Khmer</option>
                    <option id="ember696" class="ember-view" value="ki">Kikuyu, Gikuyu</option>
                    <option id="ember697" class="ember-view" value="rw">Kinyarwanda</option>
                    <option id="ember698" class="ember-view" value="ky">Kirghiz, Kyrgyz</option>
                    <option id="ember699" class="ember-view" value="kv">Komi</option>
                    <option id="ember700" class="ember-view" value="kg">Kongo</option>
                    <option id="ember701" class="ember-view" value="ko">Korean</option>
                    <option id="ember702" class="ember-view" value="ku">Kurdish</option>
                    <option id="ember703" class="ember-view" value="kj">Kwanyama, Kuanyama</option>
                    <option id="ember704" class="ember-view" value="la">Latin</option>
                    <option id="ember705" class="ember-view" value="lb">Luxembourgish, Letzeburgesch</option>
                    <option id="ember706" class="ember-view" value="lg">Luganda</option>
                    <option id="ember707" class="ember-view" value="li">Limburgish, Limburgan, Limburger</option>
                    <option id="ember708" class="ember-view" value="ln">Lingala</option>
                    <option id="ember709" class="ember-view" value="lo">Lao</option>
                    <option id="ember710" class="ember-view" value="lt">Lithuanian</option>
                    <option id="ember711" class="ember-view" value="lu">Luba-Katanga</option>
                    <option id="ember712" class="ember-view" value="lv">Latvian</option>
                    <option id="ember713" class="ember-view" value="gv">Manx</option>
                    <option id="ember714" class="ember-view" value="mk">Macedonian</option>
                    <option id="ember715" class="ember-view" value="mg">Malagasy</option>
                    <option id="ember716" class="ember-view" value="ms">Malay</option>
                    <option id="ember717" class="ember-view" value="ml">Malayalam</option>
                    <option id="ember718" class="ember-view" value="mt">Maltese</option>
                    <option id="ember719" class="ember-view" value="mi">Māori</option>
                    <option id="ember720" class="ember-view" value="mr">Marathi (Marāṭhī)</option>
                    <option id="ember721" class="ember-view" value="mh">Marshallese</option>
                    <option id="ember722" class="ember-view" value="mn">Mongolian</option>
                    <option id="ember723" class="ember-view" value="na">Nauru</option>
                    <option id="ember724" class="ember-view" value="nv">Navajo, Navaho</option>
                    <option id="ember725" class="ember-view" value="nb">Norwegian Bokmål</option>
                    <option id="ember726" class="ember-view" value="nd">North Ndebele</option>
                    <option id="ember727" class="ember-view" value="ne">Nepali</option>
                    <option id="ember728" class="ember-view" value="ng">Ndonga</option>
                    <option id="ember729" class="ember-view" value="nn">Norwegian Nynorsk</option>
                    <option id="ember730" class="ember-view" value="no">Norwegian</option>
                    <option id="ember731" class="ember-view" value="ii">Nuosu</option>
                    <option id="ember732" class="ember-view" value="nr">South Ndebele</option>
                    <option id="ember733" class="ember-view" value="oc">Occitan</option>
                    <option id="ember734" class="ember-view" value="oj">Ojibwe, Ojibwa</option>
                    <option id="ember735" class="ember-view" value="cu">Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic</option>
                    <option id="ember736" class="ember-view" value="om">Oromo</option>
                    <option id="ember737" class="ember-view" value="or">Oriya</option>
                    <option id="ember738" class="ember-view" value="os">Ossetian, Ossetic</option>
                    <option id="ember739" class="ember-view" value="pa">Panjabi, Punjabi</option>
                    <option id="ember740" class="ember-view" value="pi">Pāli</option>
                    <option id="ember741" class="ember-view" value="fa">Persian</option>
                    <option id="ember742" class="ember-view" value="pl">Polish</option>
                    <option id="ember743" class="ember-view" value="ps">Pashto, Pushto</option>
                    <option id="ember744" class="ember-view" value="pt">Portuguese</option>
                    <option id="ember745" class="ember-view" value="qu">Quechua</option>
                    <option id="ember746" class="ember-view" value="rm">Romansh</option>
                    <option id="ember747" class="ember-view" value="rn">Kirundi</option>
                    <option id="ember748" class="ember-view" value="ro">Romanian, Moldavian, Moldovan</option>
                    <option id="ember749" class="ember-view" value="ru">Russian</option>
                    <option id="ember750" class="ember-view" value="sa">Sanskrit (Saṁskṛta)</option>
                    <option id="ember751" class="ember-view" value="sc">Sardinian</option>
                    <option id="ember752" class="ember-view" value="sd">Sindhi</option>
                    <option id="ember753" class="ember-view" value="se">Northern Sami</option>
                    <option id="ember754" class="ember-view" value="sm">Samoan</option>
                    <option id="ember755" class="ember-view" value="sg">Sango</option>
                    <option id="ember756" class="ember-view" value="sr">Serbian</option>
                    <option id="ember757" class="ember-view" value="gd">Scottish Gaelic; Gaelic</option>
                    <option id="ember758" class="ember-view" value="sn">Shona</option>
                    <option id="ember759" class="ember-view" value="si">Sinhala, Sinhalese</option>
                    <option id="ember760" class="ember-view" value="sk">Slovak</option>
                    <option id="ember761" class="ember-view" value="sl">Slovene</option>
                    <option id="ember762" class="ember-view" value="so">Somali</option>
                    <option id="ember763" class="ember-view" value="st">Southern Sotho</option>
                    <option id="ember764" class="ember-view" value="es">Spanish; Castilian</option>
                    <option id="ember765" class="ember-view" value="su">Sundanese</option>
                    <option id="ember766" class="ember-view" value="sw">Swahili</option>
                    <option id="ember767" class="ember-view" value="ss">Swati</option>
                    <option id="ember768" class="ember-view" value="sv">Swedish</option>
                    <option id="ember769" class="ember-view" value="ta">Tamil</option>
                    <option id="ember770" class="ember-view" value="te">Telugu</option>
                    <option id="ember771" class="ember-view" value="tg">Tajik</option>
                    <option id="ember772" class="ember-view" value="th">Thai</option>
                    <option id="ember773" class="ember-view" value="ti">Tigrinya</option>
                    <option id="ember774" class="ember-view" value="bo">Tibetan Standard, Tibetan, Central</option>
                    <option id="ember775" class="ember-view" value="tk">Turkmen</option>
                    <option id="ember776" class="ember-view" value="tl">Tagalog</option>
                    <option id="ember777" class="ember-view" value="tn">Tswana</option>
                    <option id="ember778" class="ember-view" value="to">Tonga (Tonga Islands)</option>
                    <option id="ember779" class="ember-view" value="tr">Turkish</option>
                    <option id="ember780" class="ember-view" value="ts">Tsonga</option>
                    <option id="ember781" class="ember-view" value="tt">Tatar</option>
                    <option id="ember782" class="ember-view" value="tw">Twi</option>
                    <option id="ember783" class="ember-view" value="ty">Tahitian</option>
                    <option id="ember784" class="ember-view" value="ug">Uighur, Uyghur</option>
                    <option id="ember785" class="ember-view" value="uk">Ukrainian</option>
                    <option id="ember786" class="ember-view" value="ur">Urdu</option>
                    <option id="ember787" class="ember-view" value="uz">Uzbek</option>
                    <option id="ember788" class="ember-view" value="ve">Venda</option>
                    <option id="ember789" class="ember-view" value="vi">Vietnamese</option>
                    <option id="ember790" class="ember-view" value="vo">Volapük</option>
                    <option id="ember791" class="ember-view" value="wa">Walloon</option>
                    <option id="ember792" class="ember-view" value="cy">Welsh</option>
                    <option id="ember793" class="ember-view" value="wo">Wolof</option>
                    <option id="ember794" class="ember-view" value="fy">Western Frisian</option>
                    <option id="ember795" class="ember-view" value="xh">Xhosa</option>
                    <option id="ember796" class="ember-view" value="yi">Yiddish</option>
                    <option id="ember797" class="ember-view" value="yo">Yoruba</option>
                    <option id="ember798" class="ember-view" value="za">Zhuang, Chuang</option>
                </select>
            </div>
            <div id="ember567" class="ember-view">
                <div class="pwa-generator-field">
                    <label class="pwa-generator-label">Background Color
                        <a class="pwa-generator-link" href="https://www.w3.org/TR/appmanifest/#background_color-member" target="_blank">[?]</a>
                    </label>
                    <div class="pwa-generator-options">
                        <label class="pwa-generator-label">
                            <input id="ember799" class="ember-view" type="radio" value="none"> None
                        </label>
                        <label class="pwa-generator-label">
                            <input id="ember800" class="ember-view" type="radio" value="transparent"> Transparent
                        </label>
                        <label class="pwa-generator-label">
                            <input id="ember801" class="ember-view" type="radio" value="pick"> Custom color
                        </label>
                        <!---->
                    </div>
                </div>
            </div>
            <label class="pwa-generator-toggle">
                <input type="checkbox" class="pwa-generator-togglecheck">
                <h4 class="pwa-generator-subtitle pwa-generator-subtitle--toggleable" data-ember-action="570">Specify related applications to be added to the manifest.</h4>
            </label>
            <!---->
            <label class="pwa-generator-toggle">
                <input type="checkbox" class="pwa-generator-togglecheck">
                <h4 class="pwa-generator-subtitle pwa-generator-subtitle--toggleable" data-ember-action="571">Specify custom members to be added to the manifest.</h4>
            </label>
            <!---->
        </div>
        <div class="pure-u-1 pure-u-md-1-2 generator-section manifest manifest-holder" id="manifest_holder">
            <header class="pwa-generator-header pwa-generator-header--sub">
                W3C Manifest
                <button class="pwa-button pwa-button--simple pwa-button--brand pwa-button--header" data-ember-action="572">Next step</button>
            </header>
            <div class="pwa-generator-code">
                <div class="pwa-generator-header pwa-generator-header--rounded">
                    <div class="pwa-generator-content">
                        <a id="ember581" class="ember-view skip-link pwa-button pwa-button--simple pwa-button--warning">Warnings (1)
                        </a>
                        <a id="ember582" class="ember-view skip-link pwa-button pwa-button--simple">Suggestions (6)
                        </a>
                        <span id="ember583" class="ember-view pwa-generator-contentright">
                            <button data-flare="{&quot;category&quot;: &quot;Download&quot;, &quot;action&quot;: &quot;Web&quot;, &quot;label&quot;: &quot;Download Archive&quot;, &quot;value&quot;: { &quot;page&quot;: &quot;/download/web&quot; }}"
                                data-ember-action="804" class="pwa-button pwa-button--simple  isEnabled">
                                Download manifest
                                <!---->
                            </button>
                            <!---->
                        </span>
                    </div>
                </div>
                <section class="manifest-body">
                    <pre id="ember584" class="ember-view language-javascript code-toolbar"><code class=" language-javascript"><span class="token punctuation">{</span>
<span class="token string">"dir"</span><span class="token punctuation">:</span> <span class="token string">"ltr"</span><span class="token punctuation">,</span>
<span class="token string">"lang"</span><span class="token punctuation">:</span> <span class="token string">"en"</span><span class="token punctuation">,</span>
<span class="token string">"name"</span><span class="token punctuation">:</span> <span class="token string">"Google"</span><span class="token punctuation">,</span>
<span class="token string">"scope"</span><span class="token punctuation">:</span> <span class="token string">"/?gws_rd=ssl"</span><span class="token punctuation">,</span>
<span class="token string">"display"</span><span class="token punctuation">:</span> <span class="token string">"browser"</span><span class="token punctuation">,</span>
<span class="token string">"start_url"</span><span class="token punctuation">:</span> <span class="token string">"http://google.es/?gws_rd=ssl"</span><span class="token punctuation">,</span>
<span class="token string">"short_name"</span><span class="token punctuation">:</span> <span class="token string">"Google"</span><span class="token punctuation">,</span>
<span class="token string">"theme_color"</span><span class="token punctuation">:</span> <span class="token string">"transparent"</span><span class="token punctuation">,</span>
<span class="token string">"description"</span><span class="token punctuation">:</span> <span class="token string">"Search the world's information, including webpages, images, videos and more. Google has many special features to help you find exactly what you're looking for."</span><span class="token punctuation">,</span>
<span class="token string">"orientation"</span><span class="token punctuation">:</span> <span class="token string">"any"</span><span class="token punctuation">,</span>
<span class="token string">"background_color"</span><span class="token punctuation">:</span> <span class="token string">"transparent"</span><span class="token punctuation">,</span>
<span class="token string">"related_applications"</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
<span class="token string">"prefer_related_applications"</span><span class="token punctuation">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
<span class="token string">"icons"</span><span class="token punctuation">:</span> <span class="token punctuation">[</span>
<span class="token punctuation">{</span>
<span class="token string">"src"</span><span class="token punctuation">:</span> <span class="token string">"/images/branding/product/ico/googleg_lodp.ico"</span><span class="token punctuation">,</span>
<span class="token string">"sizes"</span><span class="token punctuation">:</span> <span class="token string">"16x16 32x32"</span>
<span class="token punctuation">}</span>
<span class="token punctuation">]</span>
<span class="token punctuation">}</span></code><div class="toolbar"><div class="toolbar-item"><a>Copy</a></div></div></pre>
                </section>

                <div class="pwa-generator-messages pwa-generator-messages--code">

                    <div class="pwa-generator-message" id="warnings_list">
                        <h5 class="pwa-generator-subtitle">Warnings
                            <span>(1 item)</span>
                        </h5>
                        <h4 class="pwa-generator-subtitle pwa-generator-subtitle--complementary">start_url</h4>
                        <ul>
                            <li>
                                <p class="pwa-generator-issue">
                                    <strong class="pwa-generator-topic">Required https url:</strong> The target website must be served from a secure origin (i.e.
                                    moved to HTTPS) to be compliant with Progressive Web Apps requirements. Platforms affected:
                                    general.
                                </p>
                            </li>
                        </ul>

                    </div>

                    <div class="pwa-generator-message" id="suggestions_list">
                        <h5 class="pwa-generator-subtitle">Suggestions
                            <span>(6 items)</span>
                        </h5>
                        <h4 class="pwa-generator-subtitle pwa-generator-subtitle--complementary">icons</h4>
                        <ul>
                            <li>
                                <p class="pwa-generator-issue">
                                    <strong class="pwa-generator-topic">Missing image group:</strong> It appears that some image sizes used on Windows 10 are
                                    not in your Manifest. We will leave off any we can, and add defaults for any necessary
                                    images that are missing. Platforms affected: windows10.</p>
                            </li>
                            <li>
                                <p class="pwa-generator-issue">
                                    <strong class="pwa-generator-topic">Missing image:</strong> Launcher icons of the following sizes are required: 48x48, 72x72,
                                    96x96, 144x144, 192x192, 512x512. Platforms affected: android.</p>
                            </li>
                            <li>
                                <p class="pwa-generator-issue">
                                    <strong class="pwa-generator-topic">Missing image:</strong> An app icon of the following sizes is required: 76x76, 120x120,
                                    152x152 and 180x180. Platforms affected: ios.</p>
                            </li>
                            <li>
                                <p class="pwa-generator-issue">
                                    <strong class="pwa-generator-topic">Missing image:</strong> An 1024x1024 app icon for the App Store is required. Platforms
                                    affected: ios.</p>
                            </li>
                            <li>
                                <p class="pwa-generator-issue">
                                    <strong class="pwa-generator-topic">Missing image:</strong> A launch image of the following sizes is required: 750x1334,
                                    1334x750, 1242x2208, 2208x1242, 640x1136, 640x960, 1536x2048, 2048x1536, 768x1024 and
                                    1024x768. Platforms affected: ios.</p>
                            </li>
                            <li>
                                <p class="pwa-generator-issue">
                                    <strong class="pwa-generator-topic">Missing image group:</strong> It appears that some image sizes used on Windows 10 are
                                    not in your Manifest. We will leave off any we can, and add defaults for any necessary
                                    images that are missing. Platforms affected: windows.</p>
                            </li>
                        </ul>

                    </div>

                </div>

            </div>
        </div>
    </div>

    <div class="pwa-generator-buttons pwa-generator-buttons--centered">
        <!---->
        <button class="pwa-button" data-ember-action="835">Next Step</button>
    </div>
    </div>
    <TwoWays/>
</section>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "nuxt-class-component";
import { Action, State, namespace } from "vuex-class";

import GeneratorMenu from "~/components/GeneratorMenu";
import TwoWays from "~/components/TwoWays";

import * as generator from "~/store/modules/generator";

const GeneratorState = namespace(generator.name, State);
const GeneratorAction = namespace(generator.name, Action);

@Component({
  components: {
    TwoWays,
    GeneratorMenu
  }
})
export default class extends Vue {
  @GeneratorState manifest: generator.Manifest;

  public created(): void {
    if (!this.manifest) {
      this.$router.push({
        path: "/"
      });
    }
  }

  public skipCheckUrl(): void {}
}
</script>
