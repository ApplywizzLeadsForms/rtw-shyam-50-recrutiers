// src/components/InstagramReferralForm.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", 
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", 
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", 
  "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", 
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", 
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", 
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", 
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", 
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", 
  "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", 
  "Montenegro", "Morocco", "Mozambique", "Myanmar (Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", 
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", 
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", 
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", 
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", 
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", 
  "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", 
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", 
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", 
  "Zambia", "Zimbabwe"
];

export default function InstagramReferralForm({ reelSource = "Shyam--recrutiers" }: { reelSource: string }) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    source: reelSource
  });

  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const caseStudyUrl = "https://recruiters50.lovable.app/";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectCountry = (value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { firstName, lastName, email, phone, country, source } = formData;

    if (!firstName || !lastName || !email || !phone || !country) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    // Insert lead into Supabase
    const { error } = await supabase.from('leads').insert({
      name: `${firstName} ${lastName}`,
      phone: "+" + phone,
      email,
      city: country,
      source,
      status: 'New',
      current_stage: 'Prospect',
      created_at: new Date().toISOString(),
      subscribed: 'no',
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit. Try again.', variant: 'destructive' });
    } else {
      setShowSuccess(true);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', country: '', source });

    // Send email via Edge Function
      const emailResponse = await fetch("https://mrsmhqgdwjopasnpohwu.supabase.co/functions/v1/shyam-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "authorization": `Bearer ${supabaseKey}` },
        body: JSON.stringify({
          to: email, // Send email to the client's email address
          subject: "50-recrutiers",
         htmlBody: `
  <p>Hi ${firstName} ${lastName}!</p>

  <p>Thanks for commenting on our recent reel.</p>

  <p>
    As promised, here’s the 50-recrutiers these profiles form top tech companies.


  </p>

  <br />

  <a
    href="${caseStudyUrl}"
    target="_blank"
    style="
      display:inline-block;
      padding:12px 20px;
      background:#2563eb;
      color:#ffffff;
      text-decoration:none;
      border-radius:6px;
      font-weight:600;
    "
  >
    50-recrutiers
  </a>

  <br /><br />

  
`

        })
      });


      if (!emailResponse.ok) {
        toast({ title: 'Error', description: 'Failed to send email. Please try again later.', variant: 'destructive' });
      }

      setTimeout(() => setShowSuccess(false), 3000);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 space-y-4">
      <div className="text-center">
        {/* <img src="/ApplywizzLogo.png" alt="Apply Wizz" className="h-14 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground font-medium">Connect with us and be part of something amazing</p> */}
      </div>

      <Card className="w-full max-w-lg shadow-lg border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Get In Touch</CardTitle>
          <p className="text-muted-foreground text-xs">Fill out the form below and we'll get back to you soon!</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First name */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" name="firstName" value={formData.firstName}
                       onChange={handleChange} placeholder="Enter your first name" required />
              </div>

              {/* Last name */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" name="lastName" value={formData.lastName}
                       onChange={handleChange} placeholder="Enter your last name" required />
              </div>

              {/* Email (full width) */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" name="email" type="email" value={formData.email}
                       onChange={handleChange} placeholder="Enter your email address" required />
              </div>

              {/* Phone */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <PhoneInput
                  country="us"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputProps={{ name: 'phone', id: 'phone', required: true }}
                  containerClass="w-full"
                  inputClass="!w-full !h-10 !text-sm !bg-background !border !border-input !rounded-md !pl-12 focus:!outline-none focus:!ring-2 focus:!ring-ring"
                  buttonClass="!h-10 !bg-background !border !border-input !rounded-l-md"
                  dropdownClass="!bg-popover !text-popover-foreground"
                  enableSearch
                  countryCodeEditable={false}
                />
              </div>

              {/* Country */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="country">Country *</Label>
                <Select onValueChange={handleSelectCountry} value={formData.country}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(countries)).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <input type="hidden" name="source" value={formData.source} />
            <Button type="submit" className="w-full bg-blue-500" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </form>

          {/* LOADING ANIMATION */}
          {isSubmitting && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm pointer-events-auto">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-500 border-solid"></div>
            </div>
          )}

          {/* SUCCESS ANIMATION */}
          {showSuccess && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-green-50/90 backdrop-blur-sm">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center animate-bounce-in">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="mt-4 text-green-700 font-semibold text-xl animate-fade-in">
                Your form was submitted!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
