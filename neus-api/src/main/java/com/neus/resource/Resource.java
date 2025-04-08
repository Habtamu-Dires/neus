package com.neus.resource;

import com.neus.common.SubscriptionLevel;
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
    private String description;
    @Enumerated(EnumType.STRING)
    private SubscriptionLevel requiredSubLevel = SubscriptionLevel.FREE;
    private String contentPath;

    @OneToMany(mappedBy = "parentResource")
    private List<Resource> resourceList;

    @ManyToOne
    @JoinColumn(name = "parent_resource_id")
    private Resource parentResource;

    @OneToOne
    @JoinColumn(name = "preview_resource_id")
    private Resource previewResource;

}
