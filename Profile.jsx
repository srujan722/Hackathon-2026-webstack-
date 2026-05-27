export default function Profile({ userName }) {
  return (
    <main className="flex-1 overflow-y-auto py-12 px-4 sm:px-6 lg:px-8 z-10 w-full">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
        {/* Profile Header */}
        <div className="glass-panel rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-outline-variant/30">
          <div className="absolute inset-0 bg-primary/5"></div>
          
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-surface shadow-xl overflow-hidden relative">
              <img src="/devansh-profile.jpg" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-secondary rounded-full border-2 border-surface flex items-center justify-center text-on-secondary shadow-md">
              <span className="material-symbols-outlined text-[16px]">verified</span>
            </div>
          </div>
          
          <div className="relative text-center md:text-left">
            <h1 className="font-display-lg-mobile text-3xl md:text-4xl text-primary font-bold">{userName || 'Devansh'}</h1>
            <p className="text-on-surface-variant font-body-md mt-1 mb-4">Senior Municipal Engineer, Lavasa Water Dept</p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-label-caps tracking-wider">Zone A Specialist</span>
              <span className="px-3 py-1 bg-surface-container-high rounded-full text-xs font-label-caps tracking-wider">Emergency Response Team</span>
            </div>
          </div>
        </div>

        {/* Performance Stats Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl text-center border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-primary mb-2 text-3xl">task_alt</span>
            <h3 className="font-display-lg-mobile text-2xl text-on-surface font-bold">1,204</h3>
            <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-widest mt-1">Issues Resolved</p>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-secondary mb-2 text-3xl">timer</span>
            <h3 className="font-display-lg-mobile text-2xl text-on-surface font-bold">4.2<span className="text-sm">hrs</span></h3>
            <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-widest mt-1">Avg Resolution</p>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-green-400 mb-2 text-3xl">offline_bolt</span>
            <h3 className="font-display-lg-mobile text-2xl text-on-surface font-bold">98<span className="text-sm">%</span></h3>
            <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-widest mt-1">Efficiency Rating</p>
          </div>
          <div className="glass-panel p-4 rounded-xl text-center border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-amber-400 mb-2 text-3xl">emoji_events</span>
            <h3 className="font-display-lg-mobile text-2xl text-on-surface font-bold">Top 5</h3>
            <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-widest mt-1">City Engineers</p>
          </div>
        </div>

        {/* Layout for Certifications and Experience */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Certifications (Left Column) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-panel rounded-xl p-6 border border-outline-variant/30">
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold mb-4 border-b border-outline-variant/20 pb-2">Active Certifications</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-0.5">workspace_premium</span>
                  <div>
                    <h4 className="font-title-sm text-primary font-medium text-sm">Advanced Hydrodynamics</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Issued: Jan 2024 • Validity: 3 Years</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-0.5">workspace_premium</span>
                  <div>
                    <h4 className="font-title-sm text-primary font-medium text-sm">SCADA Systems Operations</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Issued: Mar 2023 • Lavasa Tech Institute</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary mt-0.5">workspace_premium</span>
                  <div>
                    <h4 className="font-title-sm text-primary font-medium text-sm">Urban Water Quality Control</h4>
                    <p className="text-xs text-on-surface-variant mt-1">Issued: Nov 2022 • National Board</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="glass-panel rounded-xl p-6 border border-outline-variant/30">
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold mb-4 border-b border-outline-variant/20 pb-2">Contact Info</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">mail</span>
                  <span className="text-on-surface">devansh@lavasa-water.gov</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">call</span>
                  <span className="text-on-surface">+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">location_on</span>
                  <span className="text-on-surface">HQ - Sector Dasve, Block 4</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Experience Section (Right Column) */}
          <div className="lg:col-span-8 glass-panel rounded-xl p-8 border border-outline-variant/30">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-secondary">work_history</span>
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Service Experience</h2>
          </div>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/50 before:to-transparent">
            
            {/* Experience Item 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="material-symbols-outlined text-[18px]">plumbing</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl glass-panel shadow-sm border border-outline-variant/30">
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-2">
                  <h3 className="font-title-sm text-primary font-bold">Lead Water Engineer</h3>
                  <time className="text-xs font-label-caps text-on-surface-variant">2023 - Present</time>
                </div>
                <p className="text-body-sm text-on-surface-variant">Spearheaded the integration of real-time monitoring sensors across Lavasa's residential sectors. Reduced leak response times by 40%.</p>
              </div>
            </div>

            {/* Experience Item 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-secondary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="material-symbols-outlined text-[18px]">engineering</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl glass-panel shadow-sm border border-outline-variant/30">
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-2">
                  <h3 className="font-title-sm text-primary font-bold">Field Operations Supervisor</h3>
                  <time className="text-xs font-label-caps text-on-surface-variant">2020 - 2023</time>
                </div>
                <p className="text-body-sm text-on-surface-variant">Managed a team of 12 field technicians handling daily infrastructure maintenance and emergency pipeline repairs.</p>
              </div>
            </div>

            {/* Experience Item 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-surface-container-highest text-on-surface-variant shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <span className="material-symbols-outlined text-[18px]">school</span>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl glass-panel shadow-sm border border-outline-variant/30">
                <div className="flex flex-col md:flex-row items-baseline justify-between mb-2">
                  <h3 className="font-title-sm text-primary font-bold">Junior Technician</h3>
                  <time className="text-xs font-label-caps text-on-surface-variant">2018 - 2020</time>
                </div>
                <p className="text-body-sm text-on-surface-variant">Completed comprehensive training and apprenticeship in municipal water supply systems and sanitation architecture.</p>
              </div>
            </div>

          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
