
        const canvas = document.getElementById('kmeansCanvas');
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        let points = [];
        let centroids = [];
        let currentStep = 0; // 0 = ready to assign, 1 = ready to update centroids
        let isConverged = false;
        let animationId = null;
        let timeoutId = null;

        const colors = [
            '#ef4444', // Red
            '#3b82f6', // Blue
            '#10b981', // Green
            '#f59e0b', // Yellow/Orange
            '#8b5cf6', // Purple
            '#06b6d4'  // Cyan
        ];

        // Canvas Click to add point
        canvas.addEventListener('click', (e) => {
            if (isConverged || centroids.length > 0) {
                // If running or converged, clicking resets everything and starts over
                clearCanvas();
            }
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            points.push({x, y, cluster: -1});
            updateButtonStates();
            draw();
            updateStatus("Titik ditambahkan. Tambahkan lagi atau klik Acak Centroid.");
        });

        function updateButtonStates() {
            const hasPoints = points.length > 0;
            const hasCentroids = centroids.length > 0;
            
            document.getElementById('btnInit').disabled = !hasPoints;
            document.getElementById('btnStep').disabled = !hasCentroids || isConverged;
            document.getElementById('btnRun').disabled = !hasCentroids || isConverged;
            document.getElementById('kValue').disabled = hasCentroids && !isConverged;
            
            if (hasCentroids || isConverged) {
                canvas.style.cursor = 'not-allowed';
            } else {
                canvas.style.cursor = 'crosshair';
            }
        }

        function clearCanvas() {
            points = [];
            centroids = [];
            currentStep = 0;
            isConverged = false;
            clearTimeout(timeoutId);
            cancelAnimationFrame(animationId);
            updateButtonStates();
            draw();
            updateStatus("Kanvas dibersihkan. Tambahkan data baru.");
        }

        function generateData() {
            if (centroids.length > 0) clearCanvas();
            
            // Create 3-5 random cluster centers
            const numBlobs = Math.floor(Math.random() * 3) + 3;
            const blobs = [];
            for(let i=0; i<numBlobs; i++){
                blobs.push({
                    cx: 100 + Math.random() * (width - 200),
                    cy: 100 + Math.random() * (height - 200),
                    std: 20 + Math.random() * 30
                });
            }

            // Generate points around blobs
            for (let i = 0; i < 200; i++) {
                const blob = blobs[Math.floor(Math.random() * blobs.length)];
                
                // Box-Muller transform for normal distribution
                let u = 0, v = 0;
                while(u === 0) u = Math.random();
                while(v === 0) v = Math.random();
                let z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                let z1 = Math.sqrt(-2.0 * Math.log(u)) * Math.sin(2.0 * Math.PI * v);
                
                let x = blob.cx + z0 * blob.std;
                let y = blob.cy + z1 * blob.std;

                // constrain to canvas
                x = Math.max(10, Math.min(width - 10, x));
                y = Math.max(10, Math.min(height - 10, y));

                points.push({x, y, cluster: -1});
            }
            updateButtonStates();
            draw();
            updateStatus(`${points.length} titik data di-generate. Silakan mulai K-Means.`);
        }

        function initCentroids() {
            if (points.length === 0) {
                alert("Tambahkan data terlebih dahulu!");
                return;
            }
            
            const k = parseInt(document.getElementById('kValue').value);
            if (points.length < k) {
                alert("Jumlah data harus lebih besar atau sama dengan nilai K!");
                return;
            }

            // Randomly pick K points as initial centroids (Forgy method)
            centroids = [];
            const shuffled = [...points].sort(() => 0.5 - Math.random());
            for (let i = 0; i < k; i++) {
                centroids.push({
                    x: shuffled[i].x,
                    y: shuffled[i].y,
                    cluster: i
                });
            }

            // Reset points
            points.forEach(p => p.cluster = -1);
            
            currentStep = 0;
            isConverged = false;
            
            updateButtonStates();
            draw();
            updateStatus(`Centroid diinisialisasi secara acak (K=${k}). Tekan 'Next Step' untuk assign data.`);
        }

        function getDistance(p1, p2) {
            return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        }

        function assignPoints() {
            let changed = false;
            points.forEach(p => {
                let minDist = Infinity;
                let closestCluster = -1;
                
                centroids.forEach((c, index) => {
                    const dist = getDistance(p, c);
                    if (dist < minDist) {
                        minDist = dist;
                        closestCluster = index;
                    }
                });

                if (p.cluster !== closestCluster) {
                    changed = true;
                    p.cluster = closestCluster;
                }
            });
            return changed;
        }

        function updateCentroidPositions() {
            let maxShift = 0;
            const k = centroids.length;
            
            for (let i = 0; i < k; i++) {
                const clusterPoints = points.filter(p => p.cluster === i);
                if (clusterPoints.length > 0) {
                    const sumX = clusterPoints.reduce((sum, p) => sum + p.x, 0);
                    const sumY = clusterPoints.reduce((sum, p) => sum + p.y, 0);
                    const newX = sumX / clusterPoints.length;
                    const newY = sumY / clusterPoints.length;
                    
                    const shift = getDistance(centroids[i], {x: newX, y: newY});
                    if (shift > maxShift) maxShift = shift;
                    
                    centroids[i].x = newX;
                    centroids[i].y = newY;
                }
            }
            return maxShift;
        }

        function stepKMeans() {
            if (isConverged) return;

            if (currentStep === 0) {
                // Step: Assign points to nearest centroid
                const pointsChanged = assignPoints();
                if (!pointsChanged && centroids.length > 0) {
                    // Even if points didn't change, we need to check if centroids will shift
                    // Actually, if points don't change, centroids won't change either.
                    isConverged = true;
                }
                updateStatus("Langkah: Data dikelompokkan ke centroid terdekat.");
                currentStep = 1;
            } else {
                // Step: Update centroid positions
                const maxShift = updateCentroidPositions();
                if (maxShift < 0.1) {
                    isConverged = true;
                }
                updateStatus("Langkah: Centroid dipindahkan ke rata-rata kelompok.");
                currentStep = 0;
            }

            draw();

            if (isConverged) {
                updateStatus("🎉 ALGORITMA KONVERGEN! Anda dapat mengacak centroid lagi untuk mencoba hasil lain.", true);
                updateButtonStates();
            }
        }

        function runKMeansFull() {
            if (isConverged) return;
            
            document.getElementById('btnStep').disabled = true;
            document.getElementById('btnRun').disabled = true;
            
            function animate() {
                if(!isConverged) {
                    stepKMeans();
                    timeoutId = setTimeout(() => {
                        animationId = requestAnimationFrame(animate);
                    }, 400); // delay to see the visual changes
                }
            }
            animate();
        }

        function updateStatus(text, highlight = false) {
            const bar = document.getElementById('statusBar');
            bar.innerHTML = `<span class="status-badge">Status</span> ${text}`;
            if(highlight) {
                bar.style.backgroundColor = "rgba(74, 222, 128, 0.1)";
                bar.style.borderColor = "rgba(74, 222, 128, 0.3)";
                bar.style.color = "#4ade80";
            } else {
                bar.style.backgroundColor = "rgba(84, 197, 248, 0.1)";
                bar.style.borderColor = "rgba(84, 197, 248, 0.3)";
                bar.style.color = "var(--primary-color)";
            }
        }

        function draw() {
            // Clear canvas
            ctx.fillStyle = '#0f172a'; // match bg-color
            ctx.fillRect(0, 0, width, height);

            // Draw connecting lines if assigned
            if (currentStep === 1 || isConverged) {
                ctx.globalAlpha = 0.2;
                points.forEach(p => {
                    if (p.cluster !== -1) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(centroids[p.cluster].x, centroids[p.cluster].y);
                        ctx.strokeStyle = colors[p.cluster % colors.length];
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });
                ctx.globalAlpha = 1.0;
            }

            // Draw points
            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = p.cluster === -1 ? 'rgba(255,255,255,0.5)' : colors[p.cluster % colors.length];
                ctx.fill();
                if(p.cluster !== -1) {
                    ctx.strokeStyle = '#0f172a';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            // Draw centroids
            centroids.forEach(c => {
                // Draw a cross
                ctx.beginPath();
                ctx.moveTo(c.x - 8, c.y - 8);
                ctx.lineTo(c.x + 8, c.y + 8);
                ctx.moveTo(c.x + 8, c.y - 8);
                ctx.lineTo(c.x - 8, c.y + 8);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(c.x - 8, c.y - 8);
                ctx.lineTo(c.x + 8, c.y + 8);
                ctx.moveTo(c.x + 8, c.y - 8);
                ctx.lineTo(c.x - 8, c.y + 8);
                ctx.strokeStyle = colors[c.cluster % colors.length];
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw a circle around it
                ctx.beginPath();
                ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });
        }

        // Initial draw
        draw();

        function copyCode(btn) {
            const codeBlock = btn.closest('.code-block').querySelector('code');
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
                setTimeout(() => {
                    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
                }, 2000);
            });
        }
    