export type langType = {
    code: string;
    name: string;
};
export type langCodes = {
    formatted: string;
    code: string;
};
export declare const localeStrings: {
    button: {
        done: string;
        upload: string;
        download: string;
        generate: string;
        add_url: string;
    };
    input: {
        home: {
            error: {
                promises: string;
                invalidURL: string;
            };
        };
        manifest: {
            screenshot: {
                error: string;
            };
        };
        publish: {
            windows: {
                test_package: string;
            };
            base_package: {
                download: string;
            };
        };
        basepack: {
            run_new: string;
        };
    };
    text: {
        publish: {
            windows_platform: {
                p: string;
            };
        };
        base_package: {
            top_section: {
                h1: string;
                p: string;
            };
            summary_body: {
                h1: string;
                p: string;
            };
            next_steps: {
                h1: string;
            };
        };
        manifest_options: {
            top_section: {
                h1: string;
            };
            summary_body: {
                h1: string;
                p: string;
            };
            info: {
                h1: string;
            };
            images: {
                h1: string;
                icons: {
                    h3: string;
                };
                screenshots: {
                    h3: string;
                    p: string;
                };
            };
            settings: {
                h1: string;
                background_color: {
                    h3: string;
                };
                theme_color: {
                    h3: string;
                };
            };
            view_code: {
                h1: string;
            };
            titles: {
                name: string;
                short_name: string;
                description: string;
                start_url: string;
                scope: string;
                display: string;
                orientation: string;
                language: string;
            };
            descriptions: {
                short_name: string;
                description: string;
                start_url: string;
                scope: string;
                display: string;
                orientation: string;
                language: string;
            };
        };
        android: {
            titles: {
                package_name: string;
                app_name: string;
                launcher_name: string;
                all_settings: string;
                app_version: string;
                app_version_code: string;
                host: string;
                start_url: string;
                theme_color: string;
                splash_color: string;
                nav_color: string;
                dark_color: string;
                div_color: string;
                div_dark_color: string;
                icon_url: string;
                mask_icon_url: string;
                mono_icon_url: string;
                fallback: string;
                custom: string;
                web_view: string;
                display_mode: string;
                standalone: string;
                fullscreen: string;
                notification: string;
                enable: string;
                location_delegation: string;
                google_play_billing: string;
                settings_shortcut: string;
                chromeos_only: string;
                metaquest: string;
                generate: string;
                source_code: string;
                none: string;
                signing_key: string;
                key_file: string;
                key_alias: string;
                key_fullname: string;
                key_org: string;
                key_org_unit: string;
                key_country_code: string;
                key_pw: string;
                key_store_pw: string;
            };
            description: {
                package_name: string;
                launcher_name: string;
                app_version: string;
                app_version_code: string;
                start_url: string;
                start_url_short: string;
                theme_color: string;
                splash_color: string;
                nav_color: string;
                dark_color: string;
                div_color: string;
                div_dark_color: string;
                mask_icon_url: string;
                mono_icon_url: string;
                custom: string;
                web_view: string;
                standalone: string;
                fullscreen: string;
                notification: string;
                location_delegation: string;
                google_play_billing: string;
                settings_shortcut: string;
                chromeos_only: string;
                metaquest: string;
                form_details: string;
                source_code: string;
                signing_key: string;
                unsigned_key: string;
                upload_signing_key: string;
                key_country_code: string;
                key_pw: string;
                key_store_pw: string;
            };
        };
        resource_hub: {
            titles: {
                blog: string;
                demo: string;
                documentation: string;
            };
            description: {
                blog: string;
                demo: string;
                documentation: string;
            };
        };
        resource_hub_new: {
            titles: {
                manifest: string;
                sw: string;
                https: string;
            };
            description: {
                manifest: string;
                sw: string;
                https: string;
            };
        };
        community_hub: {
            titles: {
                github: string;
                twitter: string;
                discord: string;
            };
            description: {
                github: string;
                twitter: string;
                discord: string;
            };
        };
        success_stories: {
            stat: {
                trivago: string;
                alibaba: string;
                pintrest: string;
                tinder: string;
            };
            value: {
                trivago: string;
                alibaba: string;
                pintrest: string;
                tinder: string;
            };
            description: {
                trivago: string;
                alibaba: string;
                pintrest: string;
                tinder: string;
            };
        };
    };
    tooltip: {
        manifest_options: {
            upload: string;
            generate: string;
            background_color: string;
            theme_color: string;
            name: string;
            short_name: string;
            start_url: string;
            scope: string;
            display: string;
            orientation: string;
            language: string;
            description: string;
        };
    };
    values: {
        none: string;
        transparent: string;
        custom: string;
    };
    imageGenerator: {
        windows11: string;
        android: string;
        ios: string;
        image_generator: string;
        image_generator_text: string;
        image_details: string;
        image_details_text: string;
        input_image: string;
        input_image_help: string;
        padding: string;
        padding_text: string;
        background_color: string;
        best_guess: string;
        transparent: string;
        custom_color: string;
        platforms: string;
        platforms_text: string;
    };
};
export declare function locale(key: string): string;
export declare const languageCodes: Array<langCodes>;
