document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    /* ==========================================================================
       MOBILE NAVIGATION OVERLAY
       ========================================================================== */
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileClose = document.querySelector('.mobile-close');
    const mobileMenu = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    const toggleMobileMenu = (open) => {
        if (open) {
            mobileMenu.classList.add('open');
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        }
    };

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => toggleMobileMenu(true));
    }
    if (mobileClose) {
        mobileClose.addEventListener('click', () => toggleMobileMenu(false));
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => toggleMobileMenu(false));
    });

    /* ==========================================================================
       STICKY HEADER & ACTIVE NAV LINKS
       ========================================================================== */
    const header = document.querySelector('.main-header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links > a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    /* ==========================================================================
       STATS COUNTER ANIMATION
       ========================================================================== */
    const statsNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        let count = 0;
        const duration = 2000;
        const stepTime = Math.max(Math.floor(duration / target), 15);
        
        const counterInterval = setInterval(() => {
            count += Math.ceil(target / 100);
            if (count >= target) {
                element.textContent = target + (target === 98 ? '%' : '+');
                clearInterval(counterInterval);
            } else {
                element.textContent = count + (target === 98 ? '%' : '+');
            }
        }, stepTime);
    };

    const observerOptions = {
        threshold: 0.5
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statsNumbers.forEach(num => animateCounter(num));
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    /* ==========================================================================
       PORTFOLIO GRID FILTERING
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                item.classList.remove('show');
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        item.classList.add('show');
                    }
                }, 50);
            });
        });
    });

    /* ==========================================================================
       DYNAMIC INLINE SERVICES EXPANSION (ACCORDION STYLE)
       ========================================================================== */
    const expandableServiceCards = document.querySelectorAll('.expand-service-card');

    expandableServiceCards.forEach(card => {
        const cardHeader = card.querySelector('.service-card-main');
        
        cardHeader.addEventListener('click', () => {
            const isOpen = card.classList.contains('open');
            
            // Collapse all other cards (accordion behavior)
            expandableServiceCards.forEach(c => c.classList.remove('open'));
            
            // Toggle clicked card
            if (!isOpen) {
                card.classList.add('open');
            }
        });
    });

    /* ==========================================================================
       INTERACTIVE WEBSITE COST ESTIMATOR (INR PRICING)
       ========================================================================== */
    const typeCards = document.querySelectorAll('.type-card');
    const pageRange = document.getElementById('page-range');
    const pageCountVal = document.getElementById('page-count-val');
    const featureCheckboxes = document.querySelectorAll('.feature-checkbox');
    const timelineBtns = document.querySelectorAll('.timeline-btn');

    const sumProjectType = document.getElementById('sum-project-type');
    const sumBaseCost = document.getElementById('sum-base-cost');
    const sumPageMultiplierVal = document.getElementById('sum-page-multiplier-val');
    const sumPageCost = document.getElementById('sum-page-cost');
    const sumFeaturesCost = document.getElementById('sum-features-cost');
    const sumTimelineFactor = document.getElementById('sum-timeline-factor');
    const totalMinPrice = document.getElementById('total-min-price');
    const totalMaxPrice = document.getElementById('total-max-price');

    // State Variables
    let selectedType = 'landing';
    let basePrice = 12000;
    let selectedPages = 5;
    let selectedFeatures = [];
    let timelineMultiplier = 1.0;
    let timelineName = 'standard';
    let calculatedMinPrice = 12000;
    let calculatedMaxPrice = 14400;

    // Type Card Select
    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            typeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            selectedType = card.getAttribute('data-type');
            
            const baseMapping = {
                'landing': 12000,
                'corporate': 32000,
                'ecommerce': 55000,
                'saas': 85000
            };
            basePrice = baseMapping[selectedType] || 12000;
            calculateEstimate();
        });
    });

    // Page Range Input
    if (pageRange) {
        pageRange.addEventListener('input', (e) => {
            selectedPages = parseInt(e.target.value, 10);
            pageCountVal.textContent = `${selectedPages} Page${selectedPages > 1 ? 's' : ''}`;
            calculateEstimate();
        });
    }

    // Feature Checkbox toggles
    featureCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            calculateEstimate();
        });
    });

    // Timeline tab select
    timelineBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            timelineBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            timelineMultiplier = parseFloat(btn.getAttribute('data-multiplier'));
            timelineName = btn.getAttribute('data-timeline');
            calculateEstimate();
        });
    });

    const calculateEstimate = () => {
        const extraPages = Math.max(0, selectedPages - 5);
        const pageCost = extraPages * 1200;

        let featuresCost = 0;
        selectedFeatures = [];
        featureCheckboxes.forEach(cb => {
            if (cb.checked) {
                const usdPrice = parseInt(cb.getAttribute('data-price'), 10);
                const inrPrice = usdPrice * 10;
                featuresCost += inrPrice;
                selectedFeatures.push(cb.parentNode.querySelector('.feature-name').textContent);
            }
        });

        const subtotal = basePrice + pageCost + featuresCost;
        const finalCalculatedPrice = subtotal * timelineMultiplier;

        calculatedMinPrice = Math.round(finalCalculatedPrice);
        calculatedMaxPrice = Math.round(finalCalculatedPrice * 1.2);

        sumProjectType.textContent = getProjectTypeName(selectedType);
        sumBaseCost.textContent = `₹${basePrice.toLocaleString('en-IN')}`;
        sumPageMultiplierVal.textContent = selectedPages;
        sumPageCost.textContent = pageCost > 0 ? `+₹${pageCost.toLocaleString('en-IN')}` : '+₹0';
        sumFeaturesCost.textContent = featuresCost > 0 ? `+₹${featuresCost.toLocaleString('en-IN')}` : '+₹0';
        sumTimelineFactor.textContent = `${timelineMultiplier}x`;
        
        totalMinPrice.textContent = `₹${calculatedMinPrice.toLocaleString('en-IN')}`;
        totalMaxPrice.textContent = `₹${calculatedMaxPrice.toLocaleString('en-IN')}`;
    };

    const getProjectTypeName = (type) => {
        switch (type) {
            case 'landing': return 'Landing Page';
            case 'corporate': return 'Corporate Website';
            case 'ecommerce': return 'E-Commerce';
            case 'saas': return 'SaaS Web Application';
            default: return 'Custom Project';
        }
    };

    calculateEstimate();

    /* ==========================================================================
       APPLY SUB-OPTIONS FROM EXPANDED SERVICE CARDS TO CALCULATOR
       ========================================================================== */
    const applySubOptionBtns = document.querySelectorAll('.apply-sub-option-btn');

    applySubOptionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop accordion toggle when button is clicked
            
            const card = btn.closest('.expand-service-card');
            const serviceType = card.getAttribute('data-service-type');
            const selectedRadio = card.querySelector('.service-sub-option-radio:checked');
            
            if (selectedRadio) {
                const baseVal = parseInt(selectedRadio.getAttribute('data-base-price'), 10);
                const pagesVal = parseInt(selectedRadio.getAttribute('data-pages'), 10);
                
                // 1. Sync Estimator Project Type Card Active States
                typeCards.forEach(c => {
                    c.classList.remove('active');
                    if (c.getAttribute('data-type') === serviceType) {
                        c.classList.add('active');
                    }
                });
                
                // 2. Set Calculator state values
                selectedType = serviceType;
                basePrice = baseVal;
                selectedPages = pagesVal;
                
                // 3. Update Range Slider controls
                if (pageRange) {
                    pageRange.value = selectedPages;
                }
                if (pageCountVal) {
                    pageCountVal.textContent = `${selectedPages} Page${selectedPages > 1 ? 's' : ''}`;
                }
                
                // 4. Trigger calculations & flash update visual feedback
                calculateEstimate();
                
                const summaryCard = document.querySelector('.summary-card');
                if (summaryCard) {
                    summaryCard.classList.add('highlight-flash');
                    setTimeout(() => summaryCard.classList.remove('highlight-flash'), 1000);
                }
                
                // 5. Scroll smoothly to Estimator Dashboard
                const estimatorSection = document.getElementById('estimator');
                if (estimatorSection) {
                    estimatorSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    /* ==========================================================================
       APPLY ESTIMATOR TO CONTACT FORM
       ========================================================================== */
    const applyBtn = document.getElementById('apply-estimator-btn');
    const formType = document.getElementById('form-project-type');
    const formPages = document.getElementById('form-pages');
    const formTimeline = document.getElementById('form-timeline');
    const formEstimateField = document.getElementById('form-estimate');

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            if (formType) formType.value = selectedType;
            if (formPages) formPages.value = selectedPages;
            if (formTimeline) formTimeline.value = timelineName;
            
            const rangeMinStr = totalMinPrice.textContent;
            const rangeMaxStr = totalMaxPrice.textContent;
            const featuresSummary = selectedFeatures.length > 0 ? ` [Features: ${selectedFeatures.join(', ')}]` : '';
            const summaryStr = `${getProjectTypeName(selectedType)} | ${selectedPages} Pages${featuresSummary} | Delivery Multiplier: ${timelineMultiplier}x | Estimate: ${rangeMinStr} - ${rangeMaxStr}`;
            
            if (formEstimateField) {
                formEstimateField.value = summaryStr;
                formEstimateField.classList.add('highlight-flash');
                setTimeout(() => formEstimateField.classList.remove('highlight-flash'), 1000);
            }

            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    /* ==========================================================================
       CAREERS: "APPLY NOW" CLICK TRIGGERS
       ========================================================================== */
    const applyJobTriggers = document.querySelectorAll('.apply-job-trigger');
    const candidateRoleDropdown = document.getElementById('candidate-role');
    const careersFormPanel = document.querySelector('.career-form-panel');

    applyJobTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const role = trigger.getAttribute('data-role');
            if (candidateRoleDropdown) {
                candidateRoleDropdown.value = role;
            }
            if (careersFormPanel) {
                careersFormPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                careersFormPanel.style.borderColor = 'var(--primary)';
                setTimeout(() => {
                    careersFormPanel.style.borderColor = 'var(--border-color)';
                }, 1500);
            }
        });
    });

    /* ==========================================================================
       RESUME FILE UPLOAD CONTROLLER & BASE64 READER
       ========================================================================== */
    const resumeFileInput = document.getElementById('candidate-resume-file');
    const uploadStatusText = document.getElementById('file-upload-status-text');
    const selectedFileName = document.getElementById('file-selected-name');
    
    let uploadedFileBase64 = '';
    let uploadedFileName = '';
    let uploadedFileSize = '';

    if (resumeFileInput) {
        resumeFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Size validation: limit to 3.5MB to stay safe within localStorage 5MB quota
                const maxBytes = 3.5 * 1024 * 1024;
                if (file.size > maxBytes) {
                    alert('File size exceeds the 3.5MB limit. Please upload a smaller resume PDF.');
                    resumeFileInput.value = '';
                    uploadStatusText.textContent = 'Click or drag resume file here';
                    selectedFileName.textContent = 'No file selected';
                    uploadedFileBase64 = '';
                    uploadedFileName = '';
                    uploadedFileSize = '';
                    return;
                }

                uploadedFileName = file.name;
                const sizeKB = Math.round(file.size / 1024);
                uploadedFileSize = `${sizeKB} KB`;

                uploadStatusText.textContent = 'File Uploaded Successfully';
                selectedFileName.textContent = `${uploadedFileName} (${uploadedFileSize})`;

                // Read file to Base64
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedFileBase64 = event.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                uploadStatusText.textContent = 'Click or drag resume file here';
                selectedFileName.textContent = 'No file selected';
                uploadedFileBase64 = '';
                uploadedFileName = '';
                uploadedFileSize = '';
            }
        });
    }

    /* ==========================================================================
       MULTI-STEP BOOKING FORM CONTROLLER (SAVES TO LOCALSTORAGE)
       ========================================================================== */
    const formSteps = document.querySelectorAll('.form-step');
    const nextBtns = document.querySelectorAll('.next-step-btn');
    const prevBtns = document.querySelectorAll('.prev-step-btn');
    const projectForm = document.getElementById('project-booking-form');
    const formSuccessOverlay = document.getElementById('form-success-overlay');
    const closeAlertBtn = document.getElementById('close-alert-btn');
    
    let currentStep = 0;

    const showStep = (stepIndex) => {
        formSteps.forEach((step, idx) => {
            step.classList.remove('active');
            if (idx === stepIndex) {
                step.classList.add('active');
            }
        });
        currentStep = stepIndex;
    };

    const validateStepFields = (stepIndex) => {
        const stepElement = formSteps[stepIndex];
        const requiredInputs = stepElement.querySelectorAll('[required]');
        let isValid = true;
        
        requiredInputs.forEach(input => {
            if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    };

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStepFields(currentStep)) {
                showStep(currentStep + 1);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            showStep(currentStep - 1);
        });
    });

    if (projectForm) {
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('submit-project-btn');
            const originalContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-lucide="loader" class="icon-right animate-spin"></i> Processing Request...';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            const clientName = document.getElementById('client-name').value;
            const clientEmail = document.getElementById('client-email').value;
            const clientCompany = document.getElementById('client-company').value || 'Not Provided';
            const selectedFormType = document.getElementById('form-project-type').value;
            const selectedFormPages = document.getElementById('form-pages').value;
            const selectedFormTimeline = document.getElementById('form-timeline').value;
            const estimateSummaryStr = document.getElementById('form-estimate').value || `Estimate: ₹${calculatedMinPrice.toLocaleString('en-IN')} - ₹${calculatedMaxPrice.toLocaleString('en-IN')}`;

            setTimeout(() => {
                const inquiries = JSON.parse(localStorage.getItem('infobeans_inquiries') || '[]');
                const newInquiry = {
                    date: new Date().toLocaleDateString('en-IN'),
                    name: clientName,
                    email: clientEmail,
                    company: clientCompany,
                    project_type: selectedFormType,
                    pages: selectedFormPages,
                    timeline: selectedFormTimeline,
                    estimate: estimateSummaryStr,
                    min_price: calculatedMinPrice
                };
                inquiries.push(newInquiry);
                localStorage.setItem('infobeans_inquiries', JSON.stringify(inquiries));

                formSuccessOverlay.classList.add('open');
                
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalContent;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }

                projectForm.reset();
                showStep(0);
            }, 1500);
        });
    }

    if (closeAlertBtn) {
        closeAlertBtn.addEventListener('click', () => {
            formSuccessOverlay.classList.remove('open');
        });
    }

    /* ==========================================================================
       JOB APPLICATION FORM (SAVES RESUME ATTACHMENT TO LOCALSTORAGE)
       ========================================================================== */
    const jobAppForm = document.getElementById('job-application-form');
    const appSuccessOverlay = document.getElementById('app-success-overlay');
    const closeAppAlertBtn = document.getElementById('close-app-alert-btn');

    if (jobAppForm) {
        jobAppForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('submit-application-btn');
            const originalContent = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-lucide="loader" class="icon-right animate-spin"></i> Submitting CV...';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            const applicantName = document.getElementById('candidate-name').value;
            const applicantEmail = document.getElementById('candidate-email').value;
            const applicantRole = document.getElementById('candidate-role').value;
            const applicantNote = document.getElementById('candidate-note').value || 'None';

            setTimeout(() => {
                const applications = JSON.parse(localStorage.getItem('infobeans_applications') || '[]');
                const newApplication = {
                    date: new Date().toLocaleDateString('en-IN'),
                    name: applicantName,
                    email: applicantEmail,
                    role: applicantRole,
                    resume_name: uploadedFileName || 'resume.pdf',
                    resume_size: uploadedFileSize || 'N/A',
                    resume_data: uploadedFileBase64 || '', // stores base64 for admin downloads
                    note: applicantNote
                };
                applications.push(newApplication);
                localStorage.setItem('infobeans_applications', JSON.stringify(applications));

                appSuccessOverlay.classList.add('open');

                submitBtn.disabled = false;
                submitBtn.innerHTML = originalContent;
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                jobAppForm.reset();
                
                // Clear upload area label
                uploadStatusText.textContent = 'Click or drag resume file here';
                selectedFileName.textContent = 'No file selected';
                uploadedFileBase64 = '';
                uploadedFileName = '';
                uploadedFileSize = '';
            }, 1500);
        });
    }

    if (closeAppAlertBtn) {
        closeAppAlertBtn.addEventListener('click', () => {
            appSuccessOverlay.classList.remove('open');
        });
    }

    /* ==========================================================================
       ADMIN PORTAL DIALOGS (AUTH GATE & DASHBOARD POPULATORS)
       ========================================================================== */
    const openAdminBtns = [
        document.getElementById('open-admin-login'),
        document.getElementById('mobile-admin-login-btn'),
        document.getElementById('footer-admin-btn'),
        document.getElementById('navbar-admin-btn') // dropdown link
    ];
    const adminLoginModal = document.getElementById('admin-login-modal');
    const closeAdminLoginBtn = document.getElementById('close-admin-login-btn');
    const adminLoginForm = document.getElementById('admin-login-form');
    const authErrorMsg = document.getElementById('auth-error-msg');

    const adminDashboardPanel = document.getElementById('admin-dashboard-panel');
    const closeAdminDashboardBtn = document.getElementById('close-admin-dashboard-btn');
    const clearAllDataBtn = document.getElementById('clear-all-data-btn');

    openAdminBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMobileMenu(false);
                adminLoginModal.classList.add('open');
                authErrorMsg.style.display = 'none';
                document.getElementById('admin-password').value = '';
            });
        }
    });

    if (closeAdminLoginBtn) {
        closeAdminLoginBtn.addEventListener('click', () => {
            adminLoginModal.classList.remove('open');
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passwordVal = document.getElementById('admin-password').value;

            if (passwordVal === 'gourav289') {
                authErrorMsg.style.display = 'none';
                adminLoginModal.classList.remove('open');
                
                adminDashboardPanel.classList.add('open');
                document.body.style.overflow = 'hidden';
                renderAdminData();
            } else {
                authErrorMsg.style.display = 'block';
                const loginBox = document.querySelector('.admin-login-box');
                loginBox.classList.add('shake-element');
                setTimeout(() => loginBox.classList.remove('shake-element'), 500);
            }
        });
    }

    if (closeAdminDashboardBtn) {
        closeAdminDashboardBtn.addEventListener('click', () => {
            adminDashboardPanel.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // Dashboard tab toggles
    const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');

    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            adminTabBtns.forEach(b => b.classList.remove('active'));
            adminTabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = btn.getAttribute('data-tab');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    const renderAdminData = () => {
        // Seed sample demo data if localStorage is completely empty (first visit)
        if (!localStorage.getItem('infobeans_inquiries') && !localStorage.getItem('infobeans_applications')) {
            const sampleInquiries = [
                {
                    date: new Date().toLocaleDateString('en-IN'),
                    name: 'Rohan Mehta',
                    email: 'rohan.mehta@example.com',
                    company: 'Mehta Enterprises',
                    project_type: 'ecommerce',
                    pages: '10',
                    timeline: 'standard',
                    estimate: 'E-Commerce Storefront | 10 Pages | Delivery Multiplier: 1.0x | Estimate: ₹55,000 - ₹66,000',
                    min_price: 55000
                },
                {
                    date: new Date().toLocaleDateString('en-IN'),
                    name: 'Priya Sharma',
                    email: 'priya@techvision.in',
                    company: 'TechVision Pvt Ltd',
                    project_type: 'saas',
                    pages: '15',
                    timeline: 'rush',
                    estimate: 'SaaS Web Application | 15 Pages | Features: CMS Panel, Payment Gateway | Estimate: ₹1,11,000 - ₹1,33,200',
                    min_price: 111000
                }
            ];
            const sampleApplications = [
                {
                    date: new Date().toLocaleDateString('en-IN'),
                    name: 'Arjun Patel',
                    email: 'arjun.patel@gmail.com',
                    role: 'Junior Full-Stack Web Developer',
                    resume_name: 'arjun_patel_resume.pdf',
                    resume_size: '320 KB',
                    resume_data: '',
                    note: 'I have 1 year of freelance experience building WordPress and React sites. Excited to join InfoBeans and grow with the team!'
                }
            ];
            localStorage.setItem('infobeans_inquiries', JSON.stringify(sampleInquiries));
            localStorage.setItem('infobeans_applications', JSON.stringify(sampleApplications));
        }

        const inquiries = JSON.parse(localStorage.getItem('infobeans_inquiries') || '[]');
        const applications = JSON.parse(localStorage.getItem('infobeans_applications') || '[]');


        const inquiriesCountEl = document.getElementById('metrics-inquiries-count');
        const pipelineValEl = document.getElementById('metrics-pipeline-value');
        const applicationsCountEl = document.getElementById('metrics-applications-count');

        if (inquiriesCountEl) inquiriesCountEl.textContent = inquiries.length;
        if (applicationsCountEl) applicationsCountEl.textContent = applications.length;

        let pipelineSum = 0;
        inquiries.forEach(inq => {
            pipelineSum += (inq.min_price || 0);
        });
        if (pipelineValEl) {
            pipelineValEl.textContent = `₹${pipelineSum.toLocaleString('en-IN')}`;
        }

        // Render Inquiries Table
        const inquiriesTableBody = document.getElementById('inquiries-table-body');
        if (inquiriesTableBody) {
            if (inquiries.length === 0) {
                inquiriesTableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-muted">No inquiry records found. Submissions will appear here in real-time.</td>
                    </tr>
                `;
            } else {
                inquiriesTableBody.innerHTML = inquiries.map((inq, index) => {
                    const badgeClass = getProjectTypeBadge(inq.project_type);
                    return `
                        <tr onclick="openInquiryDrawer(${index})" class="clickable-row">
                            <td>${inq.date}</td>
                            <td class="font-semibold">${inq.name}</td>
                            <td><a href="mailto:${inq.email}" class="text-gradient" onclick="event.stopPropagation()">${inq.email}</a></td>
                            <td><span class="badge-db ${badgeClass}">${getProjectTypeName(inq.project_type)}</span></td>
                            <td>${inq.pages}</td>
                            <td><span class="font-semibold">₹${(inq.min_price || 0).toLocaleString('en-IN')} - ₹${Math.round((inq.min_price || 0) * 1.2).toLocaleString('en-IN')}</span></td>
                            <td><span class="badge-db orange">${inq.timeline}</span></td>
                            <td>
                                <div style="display:flex;align-items:center;gap:0.5rem;">
                                    <span class="row-click-hint"><i data-lucide="eye" style="width:12px;height:12px;"></i> View</span>
                                    <button class="delete-row-btn delete-inquiry-btn" data-index="${index}" title="Remove Inquiry" onclick="event.stopPropagation()">
                                        <i data-lucide="trash-2" class="icon-sm"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
            }

        }

        // Render Applications Table with Base64 Resume Download Link
        const applicationsTableBody = document.getElementById('applications-table-body');
        if (applicationsTableBody) {
            if (applications.length === 0) {
                applicationsTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-muted">No job applicant records found. Candidates applying via Careers form will appear here.</td>
                    </tr>
                `;
            } else {
                applicationsTableBody.innerHTML = applications.map((app, index) => {
                    const badgeClass = app.role.includes('Developer') ? 'blue' : (app.role.includes('Designer') ? 'green' : 'orange');
                    
                    // Format resume download action
                    let resumeActionHTML = '';
                    if (app.resume_data) {
                        resumeActionHTML = `<a href="${app.resume_data}" download="${app.resume_name}" class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.72rem;" onclick="event.stopPropagation()"><i data-lucide="download" class="icon-left icon-sm"></i> ${app.resume_name} (${app.resume_size})</a>`;
                    } else {
                        resumeActionHTML = `<span class="text-muted" style="font-size: 0.75rem;"><i data-lucide="file" class="icon-left icon-sm"></i> No File</span>`;
                    }

                    return `
                        <tr onclick="openApplicationDrawer(${index})" class="clickable-row">
                            <td>${app.date}</td>
                            <td class="font-semibold">${app.name}</td>
                            <td><a href="mailto:${app.email}" class="text-gradient" onclick="event.stopPropagation()">${app.email}</a></td>
                            <td><span class="badge-db ${badgeClass}">${app.role}</span></td>
                            <td>${resumeActionHTML}</td>
                            <td><span class="text-muted" style="font-size: 0.8rem; display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;" title="${app.note}">${app.note}</span></td>
                            <td>
                                <div style="display:flex;align-items:center;gap:0.5rem;">
                                    <span class="row-click-hint"><i data-lucide="eye" style="width:12px;height:12px;"></i> View</span>
                                    <button class="delete-row-btn delete-application-btn" data-index="${index}" title="Remove Application" onclick="event.stopPropagation()">
                                        <i data-lucide="trash-2" class="icon-sm"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('');
            }

        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        attachDeleteEventListeners();
    };

    const getProjectTypeBadge = (type) => {
        switch (type) {
            case 'saas': return 'blue';
            case 'ecommerce': return 'green';
            default: return 'orange';
        }
    };

    const attachDeleteEventListeners = () => {
        document.querySelectorAll('.delete-inquiry-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const inquiries = JSON.parse(localStorage.getItem('infobeans_inquiries') || '[]');
                inquiries.splice(idx, 1);
                localStorage.setItem('infobeans_inquiries', JSON.stringify(inquiries));
                renderAdminData();
            });
        });

        document.querySelectorAll('.delete-application-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'), 10);
                const applications = JSON.parse(localStorage.getItem('infobeans_applications') || '[]');
                applications.splice(idx, 1);
                localStorage.setItem('infobeans_applications', JSON.stringify(applications));
                renderAdminData();
            });
        });
    };

    if (clearAllDataBtn) {
        clearAllDataBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all inquiries and job applications logs permanently?')) {
                localStorage.removeItem('infobeans_inquiries');
                localStorage.removeItem('infobeans_applications');
                renderAdminData();
            }
        });
    }

    /* ==========================================================================
       PREMIUM ORDER DETAIL DRAWER
       ========================================================================== */
    const detailDrawer      = document.getElementById('detail-drawer');
    const detailOverlay     = document.getElementById('detail-drawer-overlay');
    const drawerCloseBtn    = document.getElementById('drawer-close-btn');
    const drawerTitle       = document.getElementById('drawer-title');
    const drawerSubtitle    = document.getElementById('drawer-subtitle');
    const drawerStatusBadge = document.getElementById('drawer-status-badge');
    const drawerDate        = document.getElementById('drawer-date');
    const drawerBody        = document.getElementById('drawer-body');
    const drawerGuideSteps  = document.getElementById('drawer-guide-steps');
    const drawerDeleteBtn   = document.getElementById('drawer-delete-btn');
    const drawerContactBtn  = document.getElementById('drawer-contact-btn');
    const drawerIconBadge   = document.getElementById('drawer-icon-badge');

    let drawerCurrentType  = ''; // 'inquiry' | 'application'
    let drawerCurrentIndex = -1;

    const openDrawer = () => {
        detailDrawer.classList.add('open');
        detailOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        // Reinitialise lucide icons inside drawer
        if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    const closeDrawer = () => {
        detailDrawer.classList.remove('open');
        detailOverlay.classList.remove('open');
        document.body.style.overflow = '';
    };

    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
    if (detailOverlay)  detailOverlay.addEventListener('click', closeDrawer);

    // Format project type for display
    const formatProjectType = (type) => {
        const map = {
            landing: 'Landing Page',
            corporate: 'Corporate Website',
            ecommerce: 'E-Commerce Storefront',
            saas: 'SaaS Web Application'
        };
        return map[type] || type || 'Custom Project';
    };

    const formatTimeline = (tl) => {
        const map = {
            rush: 'Express Rush (2-3 weeks)',
            standard: 'Standard (4-6 weeks)',
            relaxed: 'Flexible (8-12 weeks)'
        };
        return map[tl] || tl || '—';
    };

    /* --- Open drawer for INQUIRY row --- */
    window.openInquiryDrawer = (index) => {
        const inquiries = JSON.parse(localStorage.getItem('infobeans_inquiries') || '[]');
        const inq = inquiries[index];
        if (!inq) return;

        drawerCurrentType  = 'inquiry';
        drawerCurrentIndex = index;

        // Header
        drawerIconBadge.innerHTML = '<i data-lucide="file-text"></i>';
        drawerTitle.textContent   = inq.name ? `${inq.name}'s Inquiry` : 'Project Inquiry';
        drawerSubtitle.textContent = 'Website / Project Booking Request';
        drawerStatusBadge.textContent = 'New Inquiry';
        drawerDate.textContent = inq.date || '—';

        // Contact button
        drawerContactBtn.href = `mailto:${inq.email}?subject=Re: Your InfoBeans Project Inquiry&body=Dear ${inq.name},%0A%0AThank you for reaching out to InfoBeans.%0A%0A`;
        drawerContactBtn.innerHTML = '<i data-lucide="send" class="icon-left"></i> Reply to Client';

        // Body content
        const priceMin = (inq.min_price || 0).toLocaleString('en-IN');
        const priceMax = Math.round((inq.min_price || 0) * 1.2).toLocaleString('en-IN');
        const timelineClass = inq.timeline === 'rush' ? 'rush' : inq.timeline === 'relaxed' ? 'relaxed' : 'standard';

        drawerBody.innerHTML = `
            <!-- Estimate Highlight -->
            <div class="estimate-highlight-box">
                <div>
                    <div class="est-label">Estimated Budget Range</div>
                    <div class="est-price">₹${priceMin} – ₹${priceMax}</div>
                </div>
                <span class="est-badge">${formatProjectType(inq.project_type)}</span>
            </div>

            <!-- Client Info -->
            <div>
                <div class="drawer-section-title">
                    <i data-lucide="user"></i> Client Information
                </div>
                <div class="detail-grid">
                    <div class="detail-card">
                        <div class="detail-card-label"><i data-lucide="user"></i> Full Name</div>
                        <div class="detail-card-value">${inq.name || '—'}</div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-card-label"><i data-lucide="building-2"></i> Company</div>
                        <div class="detail-card-value">${inq.company || 'Not Provided'}</div>
                    </div>
                    <div class="detail-card full-span">
                        <div class="detail-card-label"><i data-lucide="mail"></i> Email Address</div>
                        <a href="mailto:${inq.email}" class="detail-card-value email-link">${inq.email || '—'}</a>
                    </div>
                </div>
            </div>

            <!-- Project Details -->
            <div>
                <div class="drawer-section-title">
                    <i data-lucide="layers"></i> Project Details
                </div>
                <div class="detail-grid">
                    <div class="detail-card">
                        <div class="detail-card-label"><i data-lucide="monitor"></i> Project Type</div>
                        <div class="detail-card-value">${formatProjectType(inq.project_type)}</div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-card-label"><i data-lucide="file-stack"></i> No. of Pages</div>
                        <div class="detail-card-value">${inq.pages || '—'} Pages</div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-card-label"><i data-lucide="clock"></i> Timeline</div>
                        <div class="detail-card-value">
                            <span class="drawer-timeline-badge ${timelineClass}">${formatTimeline(inq.timeline)}</span>
                        </div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-card-label"><i data-lucide="calendar"></i> Submitted On</div>
                        <div class="detail-card-value">${inq.date || '—'}</div>
                    </div>
                </div>
            </div>

            <!-- Estimate config string -->
            ${inq.estimate ? `
            <div>
                <div class="drawer-section-title"><i data-lucide="calculator"></i> Configured Estimate</div>
                <div class="note-display-box">${inq.estimate}</div>
            </div>
            ` : ''}
        `;

        // Usage / next steps guide for inquiry
        drawerGuideSteps.innerHTML = `
            <div class="guide-step-item">
                <div class="guide-step-num">1</div>
                <div class="guide-step-text"><strong>Reply to Client:</strong> Click "Reply to Client" below — a pre-filled email will open. Greet them and confirm receipt of their project brief.</div>
            </div>
            <div class="guide-step-item">
                <div class="guide-step-num">2</div>
                <div class="guide-step-text"><strong>Schedule Discovery Call:</strong> Book a 30-minute call to discuss requirements, timeline, and feature scope in detail.</div>
            </div>
            <div class="guide-step-item">
                <div class="guide-step-num">3</div>
                <div class="guide-step-text"><strong>Send Formal Quotation:</strong> Based on the estimate of <strong>₹${priceMin} – ₹${priceMax}</strong>, prepare a detailed PDF proposal with breakdown.</div>
            </div>
            <div class="guide-step-item">
                <div class="guide-step-num">4</div>
                <div class="guide-step-text"><strong>Mark Advance Payment:</strong> Collect 40% advance after proposal approval to start the project officially.</div>
            </div>
        `;

        drawerDeleteBtn.onclick = () => {
            if (confirm('Delete this inquiry record permanently?')) {
                const all = JSON.parse(localStorage.getItem('infobeans_inquiries') || '[]');
                all.splice(index, 1);
                localStorage.setItem('infobeans_inquiries', JSON.stringify(all));
                closeDrawer();
                renderAdminData();
            }
        };

        openDrawer();
    };

    /* --- Open drawer for APPLICATION row --- */
    window.openApplicationDrawer = (index) => {
        const applications = JSON.parse(localStorage.getItem('infobeans_applications') || '[]');
        const app = applications[index];
        if (!app) return;

        drawerCurrentType  = 'application';
        drawerCurrentIndex = index;

        // Header
        drawerIconBadge.innerHTML = '<i data-lucide="user-check"></i>';
        drawerTitle.textContent   = app.name ? `${app.name}'s Application` : 'Job Application';
        drawerSubtitle.textContent = app.role || 'Job Application';
        drawerStatusBadge.textContent = 'New Applicant';
        drawerDate.textContent = app.date || '—';

        // Contact button
        drawerContactBtn.href = `mailto:${app.email}?subject=Re: Your InfoBeans Job Application – ${app.role}&body=Dear ${app.name},%0A%0AThank you for applying for the ${app.role} position at InfoBeans.%0A%0A`;
        drawerContactBtn.innerHTML = '<i data-lucide="send" class="icon-left"></i> Contact Applicant';

        const roleBadge = app.role && app.role.includes('Developer') ? 'blue' : (app.role && app.role.includes('Designer') ? 'green' : 'orange');
        const resumeHTML = app.resume_data
            ? `<a href="${app.resume_data}" download="${app.resume_name}" class="btn btn-secondary btn-sm" style="display:inline-flex;gap:0.4rem;align-items:center;font-size:0.78rem;"><i data-lucide="download"></i> ${app.resume_name} (${app.resume_size})</a>`
            : `<span style="color:var(--text-muted);font-size:0.82rem;">No file uploaded</span>`;

        drawerBody.innerHTML = `
            <!-- Role Highlight -->
            <div class="estimate-highlight-box">
                <div>
                    <div class="est-label">Applied Position</div>
                    <div class="est-price" style="font-size:1.15rem;">${app.role || '—'}</div>
                </div>
                <span class="est-badge badge-db ${roleBadge}" style="padding:0.35rem 0.75rem;">Candidate</span>
            </div>

            <!-- Applicant Info -->
            <div>
                <div class="drawer-section-title"><i data-lucide="user"></i> Applicant Details</div>
                <div class="detail-grid">
                    <div class="detail-card">
                        <div class="detail-card-label"><i data-lucide="user"></i> Full Name</div>
                        <div class="detail-card-value">${app.name || '—'}</div>
                    </div>
                    <div class="detail-card">
                        <div class="detail-card-label"><i data-lucide="calendar"></i> Applied On</div>
                        <div class="detail-card-value">${app.date || '—'}</div>
                    </div>
                    <div class="detail-card full-span">
                        <div class="detail-card-label"><i data-lucide="mail"></i> Email Address</div>
                        <a href="mailto:${app.email}" class="detail-card-value email-link">${app.email || '—'}</a>
                    </div>
                </div>
            </div>

            <!-- Resume -->
            <div>
                <div class="drawer-section-title"><i data-lucide="file-check"></i> Resume / CV File</div>
                <div class="detail-card full-span" style="display:flex;align-items:center;justify-content:space-between;">
                    <div>
                        <div class="detail-card-label"><i data-lucide="paperclip"></i> Uploaded File</div>
                        <div class="detail-card-value" style="font-size:0.82rem;">${app.resume_name || 'N/A'} ${app.resume_size ? '('+app.resume_size+')' : ''}</div>
                    </div>
                    ${resumeHTML}
                </div>
            </div>

            <!-- Cover Note -->
            ${app.note && app.note !== 'None' ? `
            <div>
                <div class="drawer-section-title"><i data-lucide="message-square"></i> Cover Note</div>
                <div class="note-display-box">${app.note}</div>
            </div>
            ` : ''}
        `;

        drawerGuideSteps.innerHTML = `
            <div class="guide-step-item">
                <div class="guide-step-num">1</div>
                <div class="guide-step-text"><strong>Review Resume:</strong> Download the CV file above and review experience, skills, and portfolio links carefully.</div>
            </div>
            <div class="guide-step-item">
                <div class="guide-step-num">2</div>
                <div class="guide-step-text"><strong>Shortlist or Decline:</strong> If the candidate looks strong, click "Contact Applicant" to schedule a screening call. Otherwise, send a polite decline email.</div>
            </div>
            <div class="guide-step-item">
                <div class="guide-step-num">3</div>
                <div class="guide-step-text"><strong>Technical Assessment:</strong> Send a 2–3 hour task relevant to the <strong>${app.role || 'position'}</strong> role before scheduling a final interview.</div>
            </div>
            <div class="guide-step-item">
                <div class="guide-step-num">4</div>
                <div class="guide-step-text"><strong>Onboard if Selected:</strong> Share the offer letter, NDA, and project onboarding materials via email on the confirmed joining date.</div>
            </div>
        `;

        drawerDeleteBtn.onclick = () => {
            if (confirm('Delete this applicant record permanently?')) {
                const all = JSON.parse(localStorage.getItem('infobeans_applications') || '[]');
                all.splice(index, 1);
                localStorage.setItem('infobeans_applications', JSON.stringify(all));
                closeDrawer();
                renderAdminData();
            }
        };

        openDrawer();
    };

});

