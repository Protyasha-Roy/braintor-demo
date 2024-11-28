let chapters = JSON.parse(localStorage.getItem('chapters')) || [];
        let totalPoints = parseInt(localStorage.getItem('totalPoints')) || 0;
        const totalPointsDisplay = document.getElementById('totalPoints');
        const chaptersList = document.getElementById('chaptersList');
        const chapterForm = document.getElementById('chapterForm');
        const popupOverlay = document.getElementById('popupOverlay');
        const submitChapterBtn = document.getElementById('submitChapterBtn');
        const closePopupBtn = document.getElementById('closePopupBtn');
        const braintorTimer = document.getElementById('braintorTimer');
        const userTimer = document.getElementById('userTimer');
        const chapterDetailsContent = document.getElementById('chapterDetailsContent');

        // Get the new popup elements
        const completionPopupOverlay = document.getElementById('completionPopupOverlay');
        const completionPopupForm = document.getElementById('completionPopupForm');
        const closeCompletionPopupBtn = document.getElementById('closeCompletionPopupBtn');
        const completionMessage = document.getElementById('completionMessage');

        // Function to display the chapter completed popup

        totalPointsDisplay.textContent = totalPoints;

        
        function updateChaptersList() {
    chaptersList.innerHTML = '<h3>Chapters List</h3>'; // Reset chapter list before updating
    
    // Sort the chapters array in descending order based on chapter.id
    const sortedChapters = chapters.sort((a, b) => b.id - a.id); // Sort in descending order
    
    sortedChapters.forEach(chapter => {
        const chapterElement = document.createElement('div');
        chapterElement.classList.add('chapter-container');
        chapterElement.innerHTML = `
            <div style="display: flex; gap: 10px; cursor: pointer;">
                <button class="btn toggle-button" onclick="selectChapter(${chapter.id})">${chapter.name}</button>
                <p style="color: red; text-decoration:underline;" onclick="deleteChapter(${chapter.id})">delete</p>
            </div>
            <div class="sub-lesson" id="subLessons-${chapter.id}">
                ${chapter.subLessons.map((subLesson, index) => `
                    <div class="subLessonName ${subLesson.marked ? 'marked' : ''}" 
                        onclick="toggleSubLessonStatus(${chapter.id}, ${index})">
                        ${subLesson.name}
                    </div>
                `).join('')}
            </div>
        `;
        chaptersList.appendChild(chapterElement);
    });
}

submitChapterBtn.addEventListener('click', () => {
    const chapterName = document.getElementById('chapterName').value;
    const totalPages = parseInt(document.getElementById('totalPages').value);
    const totalSubLessons = parseInt(document.getElementById('totalSubLessons').value);
    const difficulty = document.getElementById('difficulty').value;
    const userDeadline = new Date(document.getElementById('deadline').value);

    // Calculate the program-generated deadline
    const braintorDeadline = calculateDeadline(totalPages, totalSubLessons, difficulty);

    const pointsPerSubLesson = calculatePoints(difficulty, totalPages, totalSubLessons);
    const subLessons = Array.from({ length: totalSubLessons }, (_, index) => ({
        name: `Sub-lesson ${index + 1}`,
        marked: false
    }));

    const chapter = {
        id: chapters.length + 1,
        name: chapterName,
        difficulty,
        totalPages,
        totalSubLessons,
        pointsPerSubLesson,
        subLessons,
        userDeadline, // User-provided deadline
        braintorDeadline // Calculated deadline
    };

    chapters.push(chapter);
    localStorage.setItem('chapters', JSON.stringify(chapters));
    updateChaptersList();
    closePopup();
});
    let selectedChapterId = null; // Track the selected chapter

    // Function to update the timer based on the selected chapter
    function updateTimerDisplay() {
        const braintorTimerDisplay = document.getElementById('braintorTimer');
        const userTimerDisplay = document.getElementById('userTimer');

        if (selectedChapterId === null) {
            // No chapter selected, show placeholder text
            braintorTimerDisplay.textContent = "Select a chapter to see deadline";
            userTimerDisplay.textContent = "Select a chapter to see deadline";
            return;
        }

        const chapter = chapters.find(chap => chap.id === selectedChapterId);
        if (!chapter) {
            braintorTimerDisplay.textContent = "Select a chapter to see deadline";
            userTimerDisplay.textContent = "Select a chapter to see deadline";
            return;
        }

        const now = new Date();

        // Calculate time remaining for Braintor and User deadlines
        const braintorDeadline = new Date(chapter.braintorDeadline);
        const userDeadline = new Date(chapter.userDeadline);

        const braintorTimeRemaining = braintorDeadline - now;
        const userTimeRemaining = userDeadline - now;

        // Helper function to format remaining time
        const formatTime = ms => {
            if (ms <= 0) return "00:00:00";
            const hours = Math.floor(ms / 3600000);
            const minutes = Math.floor((ms % 3600000) / 60000);
            const seconds = Math.floor((ms % 60000) / 1000);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        braintorTimerDisplay.textContent = formatTime(braintorTimeRemaining);
        userTimerDisplay.textContent = formatTime(userTimeRemaining);
    }

    // Set interval to update the timer every second
    setInterval(updateTimerDisplay, 1000);

// Function to display the chapter completed popup
function showCompletionPopup(chapter) {
    // Calculate extra points
    const extraPoints = calculateExtraPoints(chapter);
    totalPoints += extraPoints; // Add the extra points to total points

    // Display the completion message
    completionMessage.textContent = `Congratulations! You have completed the chapter "${chapter.name}". You earned ${extraPoints} extra points.`;
    totalPointsDisplay.textContent = totalPoints; // Update the total points display

    // Show the popup
    completionPopupForm.style.display = 'block';
    completionPopupOverlay.style.display = 'block';

    // Save updated total points in localStorage
    localStorage.setItem('totalPoints', totalPoints);
}

// Function to close the completion popup
closeCompletionPopupBtn.addEventListener('click', () => {
    completionPopupForm.style.display = 'none';
    completionPopupOverlay.style.display = 'none';
});

        let currentChapterId = null; // Track the currently open chapter

        function selectChapter(chapterId) {
        selectedChapterId = chapterId; // Set the selected chapter
        const chapter = chapters.find(chap => chap.id === chapterId);
        const subLessonsContainer = document.getElementById(`subLessons-${chapterId}`);

        if (currentChapterId !== null && currentChapterId !== chapterId) {
            const currentSubLessonsContainer = document.getElementById(`subLessons-${currentChapterId}`);
            if (currentSubLessonsContainer) {
                currentSubLessonsContainer.style.display = 'none';
            }
        }

        if (subLessonsContainer.style.display === 'block') {
            subLessonsContainer.style.display = 'none';
        } else {
            subLessonsContainer.style.display = 'block';
        }

        currentChapterId = subLessonsContainer.style.display === 'block' ? chapterId : null;

        chapterDetailsContent.innerHTML = `
            <p>Chapter name: <span>${chapter.name}</span></p>
            <p>Difficulty: <span>${chapter.difficulty}</span></p>
            <p>Total pages: <span>${chapter.totalPages}</span></p>
            <p>Total sub-lessons: <span>${chapter.totalSubLessons}</span></p>
            <p>Sub-lessons left: <span>${chapter.subLessons.filter(sl => !sl.marked).length}</span></p>
            <p>Deadline(user): <span>${new Date(chapter.userDeadline).toLocaleString()}</span></p>
            <p>Deadline(Braintor): <span>${new Date(chapter.braintorDeadline).toLocaleString()}</span></p>
        `;
    }




        function toggleSubLessonStatus(chapterId, subLessonIndex) {
    const chapter = chapters.find(chap => chap.id === chapterId);
    const subLesson = chapter.subLessons[subLessonIndex];

    // Toggle the 'marked' status
    subLesson.marked = !subLesson.marked;

    // Update the points after marking/unmarking
    updatePoints();

    // Save the updated chapters to localStorage
    localStorage.setItem('chapters', JSON.stringify(chapters));

    // Find the corresponding sub-lesson element in the DOM
    const subLessonElement = document.querySelector(`#subLessons-${chapterId} .subLessonName:nth-child(${subLessonIndex + 1})`);

    if (subLessonElement) {
        // If the sub-lesson is marked, add the 'marked' class (line-through and red color)
        if (subLesson.marked) {
            subLessonElement.classList.add('marked');
        } else {
            // Otherwise, remove the 'marked' class
            subLessonElement.classList.remove('marked');
        }
    }

    // Update the chapter details, including status, after the change
    updateChapterDetails(chapterId);
}


        // Function to manually update chapter details after a sub-lesson status change
        function updateChapterDetails(chapterId) {
    const chapter = chapters.find(chap => chap.id === chapterId);
    const subLessons = chapter.subLessons;

    // Determine the chapter status based on sub-lesson markings
    let chapterStatus = "Didn't start";
    let statusColor = "red";

    const markedSubLessons = subLessons.filter(sl => sl.marked);

    if (markedSubLessons.length === 0) {
        chapterStatus = "Didn't start";
        statusColor = "red";
    } else if (markedSubLessons.length < subLessons.length) {
        chapterStatus = "On going";
        statusColor = "blue";
    } else {
        chapterStatus = "Finished";
        statusColor = "green";

         // Handle finishing the chapter
         const finishingTime = new Date();
        chapter.finishedAt = finishingTime; // Record finishing time
        localStorage.setItem("chapters", JSON.stringify(chapters));


        // Show the completion popup if the chapter is finished
        showCompletionPopup(chapter);
    }

    // Update chapter details in the UI
    chapterDetailsContent.innerHTML = `
        <p style="color: ${statusColor}; font-weight: bold;">Status: ${chapterStatus}</p>
        <p>Chapter name: <span>${chapter.name}</span></p>
        <p>Difficulty: <span>${chapter.difficulty}</span></p>
        <p>Total pages: <span>${chapter.totalPages}</span></p>
        <p>Total sub-lessons: <span>${chapter.totalSubLessons}</span></p>
        <p>Sub-lessons left: <span>${chapter.subLessons.filter(sl => !sl.marked).length}</span></p>
        <p>Deadline(user): <span>${new Date(chapter.userDeadline).toLocaleString()}</span></p>
        <p>Deadline(Braintor): <span>${new Date(chapter.braintorDeadline).toLocaleString()}</span></p>
    `;
}
function showFinishedPopup(chapter) {
    // Calculate extra points based on difficulty and chapter details
    const extraPoints = calculateExtraPoints(chapter);

    // Show a popup to notify the user that the chapter is finished
    alert(`Your chapter "${chapter.name}" is finished! You've earned an extra ${extraPoints} points.`);

    // Add the extra points to the total points
    totalPoints += extraPoints;
    totalPointsDisplay.textContent = totalPoints;

    // Save the updated points to localStorage
    localStorage.setItem('totalPoints', totalPoints);

    // Mark chapter as finished and update the list
    chapter.status = "Finished";
    updateChaptersList();  // Update the chapter list to reflect changes
}

// Function to calculate extra points when a chapter is completed
function calculateExtraPoints(chapter) {
    // Log the chapter to debug

    const difficultyMultiplier = {
        'meh': 1,
        'easy': 1.2,
        'medium': 1.3,
        'hard': 1.5,
        'extreme': 2
    };

    // Calculate the base multiplier based on the difficulty
    const multiplier = difficultyMultiplier[chapter.difficulty] || 1;

    // Calculate the base extra points based on total pages, total sub-lessons, and difficulty
    const baseExtraPoints = Math.round((chapter.totalPages / chapter.totalSubLessons) * multiplier);

    // Convert string dates into Date objects
    const braintorDeadline = new Date(chapter.braintorDeadline);
    const userDeadline = new Date(chapter.userDeadline);
    const finishedAt = new Date(chapter.finishedAt);

    let extraPoints = 0;

    // Compare finishedAt with braintorDeadline and userDeadline to adjust extra points
    if (finishedAt <= braintorDeadline && finishedAt <= userDeadline) {
        // Finished on or before the Braintor deadline (Full points)
        extraPoints = baseExtraPoints;
    } else if (finishedAt > braintorDeadline && finishedAt <= userDeadline) {
        // Finished after Braintor deadline but before or on the User deadline (Half points)
        extraPoints = Math.round(baseExtraPoints / 2);
    } else if(finishedAt > userDeadline && finishedAt <= braintorDeadline) {
        extraPoints = baseExtraPoints;
    } else {
        // Finished after both Braintor and User deadlines (Penalize)
        const exceededTime = finishedAt - userDeadline;
        const penalty = Math.ceil(exceededTime / (1000 * 60 * 60 * 24)) * baseExtraPoints * 0.25; // 10% penalty per day after the user deadline
        extraPoints = baseExtraPoints - penalty;
    }

    // Ensure the extra points cannot be negative
    extraPoints = Math.max(extraPoints);

    // Log the final extra points to debug

    return extraPoints;
}





function updatePoints() {
    totalPoints = chapters.reduce((acc, chapter) => {
        return acc + chapter.subLessons.reduce((subAcc, subLesson) => {
            return subAcc + (subLesson.marked ? chapter.pointsPerSubLesson : 0); // Add points if marked
        }, 0);
    }, 0);
    totalPointsDisplay.textContent = totalPoints;
    localStorage.setItem('totalPoints', totalPoints); // Save updated points to localStorage
}


        function closePopup() {
            chapterForm.style.display = 'none';
            popupOverlay.style.display = 'none';

            document.getElementById('chapterName').value = '';
            document.getElementById('totalPages').value = '';
            document.getElementById('totalSubLessons').value = '';
            document.getElementById('difficulty').value = '';
            document.getElementById('deadline').value = '';
        }

        function calculateDeadline(totalPages, totalSubLessons, difficulty) {
    // Define base time per sub-lesson and page in minutes
    const baseMinutesPerPage = 4; // 4 minutes per page

    // Difficulty multipliers
    const difficultyMultiplier = {
        meh: 1, // No multiplier
        easy: 1.3,
        medium: 1.5,
        hard: 1.7,
        extreme: 2
    };

    const multiplier = difficultyMultiplier[difficulty] || 1;

    // Calculate total estimated time in minutes
    const totalMinutes = (totalPages * baseMinutesPerPage) * multiplier;

    // Get the current time
    const currentTime = new Date();

    // Add the calculated time to the current time to determine the deadline
    const braintorDeadline = new Date(currentTime.getTime() + totalMinutes * 60000);

    return braintorDeadline;
}


        closePopupBtn.addEventListener('click', closePopup);

        document.getElementById('createChapterBtn').addEventListener('click', () => {
            chapterForm.style.display = 'block';
            popupOverlay.style.display = 'block';
        });

        function calculatePoints(difficulty, totalPages, totalSubLessons) {
            let multiplier = 1;
            switch (difficulty) {
                case 'meh': multiplier = 1; break;
                case 'easy': multiplier = 1.2; break;
                case 'medium': multiplier = 1.3; break;
                case 'hard': multiplier = 1.5; break;
                case 'extreme': multiplier = 2; break;
            }
            return Math.round(Math.min(((totalPages/totalSubLessons) * multiplier)));
        }

        function deleteChapter(chapterId) {
    // Step 1: Remove the chapter from the chapters array
    chapters = chapters.filter(chapter => chapter.id !== chapterId);

    // Step 2: Update localStorage with the new chapters array
    localStorage.setItem('chapters', JSON.stringify(chapters));

    // Step 3: Update the chapters list on the page
    updateChaptersList();
}

 // Show Reward Chart Popup
 document.getElementById('rewardChartBtn').addEventListener('click', () => {
            document.getElementById('rewardChartOverlay').style.display = 'block';
            document.getElementById('rewardChartPopup').style.display = 'block';
        });

        // Close Reward Chart Popup
        document.getElementById('closeRewardChartBtn').addEventListener('click', () => {
            document.getElementById('rewardChartOverlay').style.display = 'none';
            document.getElementById('rewardChartPopup').style.display = 'none';
        });

        // Add a new reward to the chart
        document.getElementById('addRewardBtn').addEventListener('click', () => {
            const type = document.getElementById('rewardType').value;
            const count = document.getElementById('rewardCount').value;
            const rewardValue = document.getElementById('rewardValue').value;

            if (count && rewardValue) {
                const reward = { type, count, reward: rewardValue };

                // Save to localStorage
                const rewards = JSON.parse(localStorage.getItem('rewardChart')) || [];
                rewards.push(reward);
                localStorage.setItem('rewardChart', JSON.stringify(rewards));

                // Update the table
                updateRewardChartTable();
                document.getElementById('rewardType').value = '';
                document.getElementById('rewardCount').value = '';
                document.getElementById('rewardValue').value = '';
            }
        });

        // Update the reward chart table
        function updateRewardChartTable() {
            const rewards = JSON.parse(localStorage.getItem('rewardChart')) || [];
            const tableBody = document.getElementById('rewardChartBody');
            tableBody.innerHTML = ''; // Clear existing rows

            rewards.forEach((reward, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reward.type}</td>
                    <td>${reward.count}</td>
                    <td>${reward.reward}</td>
                    <td>
                        <button class="btn-edit" onclick="editReward(${index})">Edit</button>
                        <button class="btn-delete" onclick="deleteReward(${index})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        // Delete a reward
        function deleteReward(index) {
            const rewards = JSON.parse(localStorage.getItem('rewardChart')) || [];
            rewards.splice(index, 1);
            localStorage.setItem('rewardChart', JSON.stringify(rewards));
            updateRewardChartTable();
        }

        // Edit a reward
        function editReward(index) {
            const rewards = JSON.parse(localStorage.getItem('rewardChart')) || [];
            const reward = rewards[index];

            document.getElementById('rewardType').value = reward.type;
            document.getElementById('rewardCount').value = reward.count;
            document.getElementById('rewardValue').value = reward.reward;

            // Remove the reward
            deleteReward(index);
        }

        // Function to reset total points and update the display
function resetTotalPoints() {
    // Reset the total points in localStorage
    localStorage.setItem('totalPoints', 0);

    // Update the UI to show the reset total points (0)
    updateTotalPoints();
}

// Function to update the displayed total points
function updateTotalPoints() {
    const totalPoints = localStorage.getItem('totalPoints') || 0; // Default to 0 if not set
    document.getElementById('totalPoints').textContent = totalPoints;
}

        document.getElementById('resetTotalBtn').addEventListener('click', resetTotalPoints);

        // Initialize the table on page load
        window.onload = () => {
            updateRewardChartTable();
        };

        // Initialize
        updateChaptersList();
        updateTimerDisplay();