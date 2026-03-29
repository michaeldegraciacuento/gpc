import { Head } from '@inertiajs/react';

interface Member {
    member_id: string;
    full_name: string;
    first_name: string;
    last_name: string;
    position: string;
    membership_type: string;
    status: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    joined_at: string | null;
    member_image_url: string | null;
}

interface Props {
    member: Member;
}

const POSITION_LABELS: Record<string, string> = {
    president: 'President',
    vice_president: 'Vice-President',
    secretary: 'Secretary',
    treasurer: 'Treasurer',
    collector: 'Collector',
    coordinator: 'Coordinator',
    member: 'Member',
};

export default function MemberProfileShow({ member }: Props) {
    const initials = `${member.first_name.charAt(0)}${member.last_name.charAt(0)}`;
    const positionLabel = POSITION_LABELS[member.position] || member.position;
    const isOfficer = member.position !== 'member';

    return (
        <>
            <Head title={`${member.full_name} — GPC Member`}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=inter:300,400,500,600,700,800&family=space-grotesk:400,500,600,700" rel="stylesheet" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <style>{`
                @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.2); } 50% { box-shadow: 0 0 40px rgba(34,197,94,0.4); } }
                .animate-fade-up { animation: fade-up 0.6s ease-out both; }
                .animate-fade-up-1 { animation: fade-up 0.6s 0.1s ease-out both; }
                .animate-fade-up-2 { animation: fade-up 0.6s 0.2s ease-out both; }
                .animate-fade-up-3 { animation: fade-up 0.6s 0.3s ease-out both; }
                .animate-fade-up-4 { animation: fade-up 0.6s 0.4s ease-out both; }
                .animate-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); background-size: 200% 100%; animation: shimmer 3s linear infinite; }
                .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
                .font-display { font-family: 'Space Grotesk', 'Inter', sans-serif; }
            `}</style>

            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 font-[Inter]">
                {/* Background pattern */}
                <div className="fixed inset-0 opacity-5">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                </div>

                <div className="relative mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-8">
                    {/* Card */}
                    <div className="w-full overflow-hidden rounded-3xl border border-white/10 bg-gray-900/80 shadow-2xl backdrop-blur-xl animate-fade-up">
                        {/* Header band */}
                        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 px-6 pb-16 pt-8">
                            <div className="animate-shimmer absolute inset-0" />
                            {/* Decorative circles */}
                            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                            <div className="absolute -left-4 bottom-4 h-16 w-16 rounded-full bg-white/5" />

                            <div className="relative flex items-center gap-3">
                                <img src="/image/gpc.png" alt="GPC" className="h-10 w-10 rounded-xl bg-white/20 object-cover p-0.5" />
                                <div>
                                    <p className="font-display text-sm font-bold tracking-wide text-white">GITAGUM PICKLEBALL CLUB</p>
                                    <p className="text-xs text-green-100/80">Official Member Card</p>
                                </div>
                            </div>
                        </div>

                        {/* Avatar overlapping header */}
                        <div className="relative -mt-12 flex justify-center">
                            <div className="animate-pulse-glow rounded-full border-4 border-gray-900 bg-gray-800">
                                {member.member_image_url ? (
                                    <img
                                        src={member.member_image_url}
                                        alt={member.full_name}
                                        className="h-24 w-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-2xl font-bold text-white">
                                        {initials}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Name & Position */}
                        <div className="px-6 pt-4 text-center animate-fade-up-1">
                            <h1 className="font-display text-2xl font-bold text-white">{member.full_name}</h1>
                            <div className="mt-2 flex items-center justify-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isOfficer ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30' : 'bg-white/10 text-gray-300 ring-1 ring-white/10'}`}>
                                    {positionLabel}
                                </span>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${member.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : member.status === 'suspended' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${member.status === 'active' ? 'bg-emerald-400' : member.status === 'suspended' ? 'bg-red-400' : 'bg-gray-400'}`} />
                                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                                </span>
                            </div>
                            <p className="mt-2 font-mono text-sm tracking-wider text-gray-500">{member.member_id}</p>
                        </div>

                        {/* Divider */}
                        <div className="mx-6 my-5 border-t border-white/5" />

                        {/* Contact Info */}
                        <div className="space-y-3 px-6 animate-fade-up-2">
                            {member.email && (
                                <a href={`mailto:${member.email}`} className="flex items-center gap-4 rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="truncate text-sm text-gray-200">{member.email}</p>
                                    </div>
                                </a>
                            )}

                            {member.phone && (
                                <a href={`tel:${member.phone}`} className="flex items-center gap-4 rounded-xl bg-white/5 px-4 py-3 transition-colors hover:bg-white/10">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="truncate text-sm text-gray-200">{member.phone}</p>
                                    </div>
                                </a>
                            )}

                            {member.address && (
                                <div className="flex items-center gap-4 rounded-xl bg-white/5 px-4 py-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">Address</p>
                                        <p className="text-sm text-gray-200">{member.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Member Since */}
                        {member.joined_at && (
                            <div className="mx-6 mt-5 animate-fade-up-3">
                                <div className="flex items-center gap-4 rounded-xl bg-white/5 px-4 py-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-gray-500">Member Since</p>
                                        <p className="text-sm text-gray-200">{member.joined_at}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-6 border-t border-white/5 px-6 py-5 text-center animate-fade-up-4">
                            <div className="flex items-center justify-center gap-2">
                                <img src="/image/gpc.png" alt="GPC" className="h-5 w-5 rounded opacity-40" />
                                <p className="text-xs text-gray-600">Gitagum Pickleball Club</p>
                            </div>
                            <p className="mt-1 text-[10px] text-gray-700">Gitagum, Misamis Oriental</p>
                        </div>
                    </div>

                    {/* Powered by */}
                    <p className="mt-6 text-center text-[10px] text-gray-700 animate-fade-up-4">
                        🏓 Scan with your phone to view this card
                    </p>
                </div>
            </div>
        </>
    );
}
