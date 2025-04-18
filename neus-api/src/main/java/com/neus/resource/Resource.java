package com.neus.resource;

import com.neus.common.SubscriptionLevel;
import com.neus.subscription_plan.SubscriptionPlan;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(name = "resource")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false,updatable = false,unique = true)
    private UUID externalId;

    @Enumerated(EnumType.STRING)
    private ResourceType type;

    @Column(unique = true, nullable = false)
    private String title;
    private String department;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Enumerated(EnumType.STRING)
    private SubscriptionLevel requiredSubLevel;
    private String contentPath;
    private String previewContentPath;

    @OneToMany(mappedBy = "parentResource")
    private List<Resource> resourceList;

    @ManyToOne
    @JoinColumn(name = "parent_resource_id")
    private Resource parentResource;

}
