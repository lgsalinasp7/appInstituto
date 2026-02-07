import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
    return (
        <footer className="bg-slate-950 text-white border-t border-white/10 pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                            KaledSoft
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Empoderando el futuro a través de tecnología de punta y educación especializada en Inteligencia Artificial.
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://linkedin.com/company/kaledsoft" target="_blank" rel="noopener noreferrer">
                                <Button size="icon" variant="ghost" className="hover:text-cyan-400 hover:bg-white/5">
                                    <Linkedin className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="https://twitter.com/kaledsoft" target="_blank" rel="noopener noreferrer">
                                <Button size="icon" variant="ghost" className="hover:text-cyan-400 hover:bg-white/5">
                                    <Twitter className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="https://instagram.com/kaledsoft" target="_blank" rel="noopener noreferrer">
                                <Button size="icon" variant="ghost" className="hover:text-cyan-400 hover:bg-white/5">
                                    <Instagram className="w-5 h-5" />
                                </Button>
                            </Link>
                            <Link href="https://facebook.com/kaledsoft" target="_blank" rel="noopener noreferrer">
                                <Button size="icon" variant="ghost" className="hover:text-cyan-400 hover:bg-white/5">
                                    <Facebook className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6 text-lg">Plataforma</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><Link href="#features" className="hover:text-cyan-400 transition-colors">Funcionalidades</Link></li>
                            <li><Link href="#pricing" className="hover:text-cyan-400 transition-colors">Precios</Link></li>
                            <li><Link href="#services" className="hover:text-cyan-400 transition-colors">Servicios</Link></li>
                            <li><Link href="/auth/login" className="hover:text-cyan-400 transition-colors">Portal Cliente</Link></li>
                            <li><Link href="mailto:ventas@kaledsoft.tech?subject=Solicitud%20de%20Demo" className="hover:text-cyan-400 transition-colors">Solicitar Demo</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6 text-lg">Recursos</h4>
                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li><Link href="mailto:soporte@kaledsoft.tech" className="hover:text-cyan-400 transition-colors">Centro de Ayuda</Link></li>
                            <li><Link href="mailto:ventas@kaledsoft.tech?subject=Consulta%20sobre%20planes" className="hover:text-cyan-400 transition-colors">Hablar con Ventas</Link></li>
                            <li><Link href="https://wa.me/573001234567?text=Hola%2C%20me%20interesa%20KaledSoft" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">WhatsApp</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Casos de Exito</Link></li>
                            <li><Link href="#" className="hover:text-cyan-400 transition-colors">Terminos y Condiciones</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-6 text-lg">Contacto</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-cyan-500 mt-0.5" />
                                <span>Colombia<br />Servicio en toda Latinoamérica</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-cyan-500" />
                                <a href="mailto:contacto@kaledsoft.tech" className="hover:text-cyan-400 transition-colors">
                                    contacto@kaledsoft.tech
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-cyan-500" />
                                <a href="mailto:ventas@kaledsoft.tech" className="hover:text-cyan-400 transition-colors">
                                    ventas@kaledsoft.tech
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-cyan-500" />
                                <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                                    +57 300 123 4567
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} KaledSoft Technologies. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
