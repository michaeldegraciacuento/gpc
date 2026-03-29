import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface Member {
    id: number;
    member_id: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    full_name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    birthdate: string | null;
    gender: string | null;
    civil_status: string | null;
    membership_type: string;
    position: string;
    status: string;
    joined_at: string;
    notes: string | null;
    member_image: string | null;
    member_image_url: string | null;
}

const POSITIONS = [
    { value: 'member', label: 'Member' },
    { value: 'president', label: 'President' },
    { value: 'vice_president', label: 'Vice-President' },
    { value: 'secretary', label: 'Secretary' },
    { value: 'treasurer', label: 'Treasurer' },
    { value: 'collector', label: 'Collector' },
    { value: 'coordinator', label: 'Coordinator' },
];

interface Props {
    member: Member;
    occupiedPositions: string[];
}

export default function MembersEdit({ member, occupiedPositions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Members', href: '/members' },
        { title: member.full_name, href: `/members/${member.id}` },
        { title: 'Edit', href: `/members/${member.id}/edit` },
    ];

    const { data, setData, processing, errors } = useForm({
        first_name: member.first_name,
        middle_name: member.middle_name || '',
        last_name: member.last_name,
        suffix: member.suffix || '',
        email: member.email || '',
        phone: member.phone || '',
        address: member.address || '',
        birthdate: member.birthdate ? member.birthdate.split('T')[0] : '',
        gender: member.gender || '',
        civil_status: member.civil_status || '',
        membership_type: member.membership_type,
        position: member.position || 'member',
        status: member.status,
        joined_at: member.joined_at ? member.joined_at.split('T')[0] : '',
        notes: member.notes || '',
        member_image: null as File | null,
        remove_member_image: false,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(member.member_image_url);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData((prev) => ({ ...prev, member_image: file, remove_member_image: false }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData((prev) => ({ ...prev, member_image: null, remove_member_image: true }));
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/members/${member.id}`, {
            ...data,
            _method: 'patch',
        }, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${member.full_name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6 flex items-center gap-4">
                    <Link href={`/members/${member.id}`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Member
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold tracking-tight">Edit Member</h1>
                        <p className="text-muted-foreground">
                            {member.member_id} &mdash; {member.full_name}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Member Photo */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Member Photo</CardTitle>
                            <CardDescription>Upload or change the member's photo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img src={imagePreview} alt="Preview" className="h-28 w-28 rounded-full border-2 border-gray-200 object-cover" />
                                            <button type="button" onClick={removeImage} className="absolute -top-1 -right-1 rounded-full bg-destructive p-1 text-white shadow-sm hover:bg-destructive/90">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                                            <Camera className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" id="member_image" />
                                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                        {imagePreview ? 'Change Photo' : 'Upload Photo'}
                                    </Button>
                                    <p className="text-muted-foreground text-xs">JPG, PNG or WebP. Max 2MB.</p>
                                    {errors.member_image && <p className="text-destructive text-sm">{errors.member_image}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Basic details about the member</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">
                                        First Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="first_name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        className={errors.first_name ? 'border-destructive' : ''}
                                    />
                                    {errors.first_name && <p className="text-destructive text-sm">{errors.first_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="middle_name">Middle Name</Label>
                                    <Input id="middle_name" value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="last_name">
                                        Last Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="last_name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        className={errors.last_name ? 'border-destructive' : ''}
                                    />
                                    {errors.last_name && <p className="text-destructive text-sm">{errors.last_name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="suffix">Suffix</Label>
                                    <Input id="suffix" placeholder="Jr., Sr., III" value={data.suffix} onChange={(e) => setData('suffix', e.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="birthdate">Date of Birth</Label>
                                    <Input
                                        id="birthdate"
                                        type="date"
                                        value={data.birthdate}
                                        onChange={(e) => setData('birthdate', e.target.value)}
                                        className={errors.birthdate ? 'border-destructive' : ''}
                                    />
                                    {errors.birthdate && <p className="text-destructive text-sm">{errors.birthdate}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select value={data.gender} onValueChange={(v) => setData('gender', v)}>
                                        <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="civil_status">Civil Status</Label>
                                    <Select value={data.civil_status} onValueChange={(v) => setData('civil_status', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Single</SelectItem>
                                            <SelectItem value="married">Married</SelectItem>
                                            <SelectItem value="widowed">Widowed</SelectItem>
                                            <SelectItem value="separated">Separated</SelectItem>
                                            <SelectItem value="divorced">Divorced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>How to reach the member</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={errors.email ? 'border-destructive' : ''}
                                    />
                                    {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} placeholder="e.g. 09171234567" />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} rows={2} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Membership Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Membership Details</CardTitle>
                            <CardDescription>Membership type, status, and enrollment date</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="membership_type">
                                        Membership Type <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.membership_type} onValueChange={(v) => setData('membership_type', v)}>
                                        <SelectTrigger className={errors.membership_type ? 'border-destructive' : ''}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="regular">Regular</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.membership_type && <p className="text-destructive text-sm">{errors.membership_type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="position">
                                        Position <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.position} onValueChange={(v) => setData('position', v)}>
                                        <SelectTrigger className={errors.position ? 'border-destructive' : ''}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {POSITIONS.map((p) => {
                                                const taken = p.value !== 'member' && occupiedPositions.includes(p.value);
                                                return (
                                                    <SelectItem key={p.value} value={p.value} disabled={taken}>
                                                        <span className="flex items-center gap-2">
                                                            {p.label}
                                                            {taken && (
                                                                <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                                    Taken
                                                                </span>
                                                            )}
                                                        </span>
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {errors.position && <p className="text-destructive text-sm">{errors.position}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">
                                        Status <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="joined_at">
                                        Date Joined <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="joined_at"
                                        type="date"
                                        value={data.joined_at}
                                        onChange={(e) => setData('joined_at', e.target.value)}
                                        className={errors.joined_at ? 'border-destructive' : ''}
                                    />
                                    {errors.joined_at && <p className="text-destructive text-sm">{errors.joined_at}</p>}
                                </div>

                                <div className="space-y-2 lg:col-span-4">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any additional information about this member..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end space-x-2">
                        <Link href={`/members/${member.id}`}>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Update Member'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
