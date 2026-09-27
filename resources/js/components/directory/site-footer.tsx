import { Link } from '@inertiajs/react';
import { becomeAPro, home } from '@/routes';

const linkClassName =
    'text-label-sm text-on-primary opacity-80 transition-all hover:underline hover:opacity-100';

export default function SiteFooter() {
    return (
        <footer className="mt-auto w-full bg-primary">
            <div className="grid w-full grid-cols-1 gap-6 px-page py-16 md:grid-cols-4">
                <div className="flex flex-col gap-4">
                    <Link
                        href={home()}
                        className="self-start"
                    >
                        <img
                            src="/images/logos/proconnect-light.png"
                            alt="ProConnect RDC"
                            className="h-8 w-auto"
                        />
                    </Link>
                    <p className="mt-2 text-body-md text-on-primary opacity-80">
                        Connecting reliable professionals with local projects
                        across the DRC.
                    </p>
                </div>
                <div className="flex flex-col gap-4">
                    <h4 className="mb-2 text-label-md font-bold text-secondary-container">
                        Platform
                    </h4>
                    <a className={linkClassName} href="#">
                        About Us
                    </a>
                    <Link
                        className={linkClassName}
                        href={`${home.url()}#how-it-works`}
                    >
                        How it Works
                    </Link>
                    <a className={linkClassName} href="#">
                        Contact
                    </a>
                </div>
                <div className="flex flex-col gap-4">
                    <h4 className="mb-2 text-label-md font-bold text-secondary-container">
                        Professionals
                    </h4>
                    <Link className={linkClassName} href={becomeAPro()}>
                        Join as Pro
                    </Link>
                </div>
                <div className="flex flex-col gap-4">
                    <h4 className="mb-2 text-label-md font-bold text-secondary-container">
                        Legal
                    </h4>
                    <a className={linkClassName} href="#">
                        Privacy Policy
                    </a>
                    <a className={linkClassName} href="#">
                        Terms of Service
                    </a>
                </div>
                <div className="col-span-1 mt-10 flex items-center justify-between border-t border-on-primary/20 pt-6 md:col-span-4">
                    <p className="text-label-sm text-on-primary opacity-60">
                        © {new Date().getFullYear()} ProConnect RDC. Tous droits
                        réservés / All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
